import test from 'node:test';
import assert from 'node:assert/strict';
import { freshProgress, parseProgress, awardWin, spendCoins } from '../web/progress.js';

test('corrupt or incompatible saves recover to valid defaults',()=>{
  for (const input of ['broken','null','[]','{}','{"version":99}']) {
    const p=parseProgress(input); assert.equal(p.coins,150); assert.equal(p.unlocked,1);
  }
  const p=parseProgress(JSON.stringify({...freshProgress(),coins:-5,unlocked:1000}));
  assert.equal(p.coins,150); assert.equal(p.unlocked,1);
});
test('first win rewards once, unlocks the next level, replay gives less',()=>{
  const p=freshProgress();
  assert.equal(awardWin(p,1,3,'attempt-one'),45);
  assert.equal(p.coins,195); assert.equal(p.unlocked,2); assert.equal(p.stars[1],3);
  assert.equal(awardWin(p,1,3,'attempt-one'),0); assert.equal(p.coins,195);
  assert.equal(awardWin(p,1,1,'attempt-two'),5); assert.equal(p.stars[1],3);
});
test('locked level wins cannot mint rewards',()=>{
  const p=freshProgress(); assert.equal(awardWin(p,20,3,'fake'),0); assert.equal(p.coins,150);
});
test('invalid or unaffordable purchases never change wallet',()=>{
  const p=freshProgress();
  for(const price of [-1,0,1.2,NaN,Infinity,240]) assert.equal(spendCoins(p,price),false);
  assert.equal(p.coins,150); assert.equal(spendCoins(p,120),true); assert.equal(p.coins,30);
});
