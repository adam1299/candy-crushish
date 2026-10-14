import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('standalone build boots from a file URL without loading external scripts or styles',async()=>{
  execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/build.js',import.meta.url))]);
  const file=new URL('../dist/Weather-Workshop.html',import.meta.url);
  const html=await readFile(file,'utf8');
  const dom=new JSDOM(html,{url:file.href,runScripts:'dangerously',beforeParse(w){
    w.matchMedia=()=>({matches:true});w.structuredClone=structuredClone;
  }});
  try {
    assert.equal(dom.window.document.querySelectorAll('.tile').length,64);
    assert.equal(dom.window.document.querySelectorAll('script[src],link[rel="stylesheet"]').length,0);
    assert.match(dom.window.document.querySelector('#status').textContent,/Storage unavailable/);
  }finally{dom.window.close();}
});
