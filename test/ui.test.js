import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { build } from 'esbuild';
import { names } from '../web/icons.js';
import { legalMoves } from '../web/engine.js';
import { freshProgress, SAVE_KEY } from '../web/progress.js';
const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');
const compiled=await build({entryPoints:[fileURLToPath(new URL('../web/app.js',import.meta.url))],bundle:true,write:false,format:'iife'});

function setup(search='') {
  const dom=new JSDOM(html,{url:'https://weather.test/'+search,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.matchMedia=()=>({matches:true});
  w.structuredClone=structuredClone;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.crypto.getRandomValues=array=>{array[0]=123;return array;};
  const progress=freshProgress();progress.settings.motion=false;
  w.localStorage.setItem(SAVE_KEY,JSON.stringify(progress));
  w.eval(compiled.outputFiles[0].text);
  return {dom,w,d:w.document};
}
async function settled(d) {
  for(let i=0;i<100;i++) {if(!d.querySelector('#restart').disabled)return;await new Promise(r=>setTimeout(r,5));}
  throw Error('UI did not settle');
}
function boardFromDOM(d) {
  return [...d.querySelectorAll('.tile')].map(t=>({kind:names.findIndex(n=>t.getAttribute('aria-label').includes(n)),special:['line','column','burst','color'].find(s=>t.classList.contains(s))}));
}
test('UI renders 64 labeled buttons, performs a match, and updates moves and score',async()=>{
  const {dom,d}=setup();
  try {
    assert.equal(d.querySelectorAll('.tile').length,64);
    const pair=legalMoves(boardFromDOM(d))[0];
    const before=Number(d.querySelector('#moves').textContent);
    pair.forEach(i=>d.querySelector(`[data-index="${i}"]`).click());
    await settled(d);
    assert.equal(Number(d.querySelector('#moves').textContent),before-1);
    assert.ok(Number(d.querySelector('#score').textContent.replaceAll(',',''))>=150);
  } finally{dom.window.close();}
});
test('arming and cancelling a booster is free; use charges exactly once',async()=>{
  const {dom,d,w}=setup();
  try {
    d.querySelector('[data-booster="pin"]').click();d.querySelector('[data-booster="pin"]').click();
    assert.equal(d.querySelector('#coins').textContent,'150');
    d.querySelector('[data-booster="pin"]').click();d.querySelector('[data-index="0"]').click();
    await settled(d);
    assert.equal(d.querySelector('#coins').textContent,'30');
    assert.equal(JSON.parse(w.localStorage.getItem(SAVE_KEY)).coins,30);
    assert.equal(d.querySelector('[data-booster="pin"]').disabled,true);
  }finally{dom.window.close();}
});
test('keyboard focus stays on the board after a successful match',async()=>{
  const {dom,d}=setup();try{
    const pair=legalMoves(boardFromDOM(d))[0];
    for(const i of pair){const tile=d.querySelector(`[data-index="${i}"]`);tile.focus();tile.click();}
    await settled(d);
    assert.equal(d.activeElement.dataset.index,String(pair[1]));
  }finally{dom.window.close();}
});
test('a swipe swaps neighbors without triggering a second click selection',async()=>{
  const {dom,d,w}=setup();try{
    const pair=legalMoves(boardFromDOM(d))[0];
    const first=d.querySelector(`[data-index="${pair[0]}"]`),horizontal=pair[1]-pair[0]===1;
    const send=(type,x,y)=>{const event=new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y});Object.defineProperty(event,'pointerId',{value:1});first.dispatchEvent(event);};
    const before=Number(d.querySelector('#moves').textContent);
    send('pointerdown',100,100);send('pointerup',horizontal?140:100,horizontal?100:140);
    await settled(d);
    assert.equal(Number(d.querySelector('#moves').textContent),before-1);
    assert.equal(d.querySelectorAll('.tile.selected').length,0);
  }finally{dom.window.close();}
});
test('map exposes 100 levels but locks all except the unlocked frontier',()=>{
  const {dom,d}=setup();try{
    d.querySelector('#map-button').click();
    assert.equal(d.querySelectorAll('[data-level]').length,100);
    assert.equal(d.querySelectorAll('[data-level]:disabled').length,99);
  }finally{dom.window.close();}
});
test('normal mode cannot offer simulated ad rewards and settings persist',()=>{
  const {dom,d,w}=setup();try{
    d.querySelector('#settings').click();
    assert.match(d.querySelector('#dialog-content').textContent,/not connected/);
    const input=d.querySelector('#sound-setting');input.checked=true;input.dispatchEvent(new w.Event('change'));
    assert.equal(JSON.parse(w.localStorage.getItem(SAVE_KEY)).settings.sound,true);
  }finally{dom.window.close();}
});
test('repeated legal UI moves finish a level and credit completion once',async()=>{
  const {dom,d,w}=setup('?ads=test');try{
    for(let move=0;move<28&&!d.querySelector('#next-level')&&!d.querySelector('#retry');move++){
      const pair=legalMoves(boardFromDOM(d))[0];assert.ok(pair);
      pair.forEach(i=>d.querySelector(`[data-index="${i}"]`).click());await settled(d);
    }
    assert.ok(d.querySelector('#next-level'),'seeded first level should win');
    const saved=JSON.parse(w.localStorage.getItem(SAVE_KEY));
    assert.equal(saved.unlocked,2);assert.ok(saved.coins>150);
    const earned=saved.coins-150;
    d.querySelector('#reward-ad').click();d.querySelector('#cancel-ad').click();
    assert.equal(JSON.parse(w.localStorage.getItem(SAVE_KEY)).coins,saved.coins);
    d.querySelector('#reward-ad').click();d.querySelector('#complete-ad').click();
    assert.equal(JSON.parse(w.localStorage.getItem(SAVE_KEY)).coins,saved.coins+earned);
    assert.equal(d.querySelector('#reward-ad'),null);
    d.querySelector('#next-level').click();assert.equal(d.querySelector('#level-number').textContent,'02');
  }finally{dom.window.close();}
});
