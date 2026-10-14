import { mkdir, cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const source=new URL('../web/',import.meta.url),dest=new URL('../dist/',import.meta.url);
await mkdir(dest,{recursive:true});
for(const file of await readdir(source))await cp(new URL(file,source),new URL(file,dest),{recursive:true});
const bundle=await build({entryPoints:[fileURLToPath(new URL('app.js',source))],bundle:true,write:false,format:'iife',target:'es2022'});
const css=await readFile(new URL('style.css',source),'utf8');
const icon=await readFile(new URL('icon.svg',source),'utf8');
const html=(await readFile(new URL('index.html',source),'utf8'))
  .replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css}</style>`)
  .replace('href="./icon.svg"',()=>`href="data:image/svg+xml,${encodeURIComponent(icon)}"`)
  .replace('<script type="module" src="./app.js"></script>',()=>`<script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`)
  .replace('href="./" aria-label="Weather Workshop home"','href="#" aria-label="Weather Workshop home"');
await writeFile(new URL('Weather-Workshop.html',dest),html);
console.log('Built native web assets and standalone dist/Weather-Workshop.html');
