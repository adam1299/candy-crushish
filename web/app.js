import { createGame, swap, useBooster, legalMoves, starsFor, BOOSTERS } from './engine.js';
import { getLevel, regions, levels } from './levels.js';
import { freshProgress, parseProgress, awardWin, spendCoins, SAVE_KEY } from './progress.js';
import { icon, names } from './icons.js';

const $=selector=>document.querySelector(selector);
const dialog=$('#dialog');
let progress=freshProgress(), storageAvailable=true;
try { progress=parseProgress(localStorage.getItem(SAVE_KEY)); } catch { storageAvailable=false; }
let game, attemptId, selected=null, armed=null, busy=false, audioContext;
const adTestMode=new URLSearchParams(location.search).get('ads')==='test';
const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion=()=>progress.settings.motion&&!prefersReducedMotion;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,motion()?ms:0));
const format=n=>n.toLocaleString('en-US');
const boosterNames={pin:'Storm pin',burst:'Pressure burst',line:'Lightning'};
const boosterSymbols={pin:'⌖',burst:'✹',line:'ϟ'};
let returnFocus=null;

function save() {
  try { localStorage.setItem(SAVE_KEY,JSON.stringify(progress)); }
  catch { storageAvailable=false; status('Storage unavailable: progress lasts only for this session.'); }
}
function status(message) { $('#status').textContent=message; }
function sound(wave=1) {
  if(!progress.settings.sound) return;
  try {
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended') audioContext.resume();
    const start=audioContext.currentTime;
    for(let n=0;n<3;n++) {
      const osc=audioContext.createOscillator(),gain=audioContext.createGain();
      osc.type='sine';osc.frequency.setValueAtTime((230+wave*45)*[1,1.25,1.5][n],start);
      gain.gain.setValueAtTime(0,start+n*.035);gain.gain.linearRampToValueAtTime(.055,start+n*.035+.01);
      gain.gain.exponentialRampToValueAtTime(.001,start+.23+n*.035);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(start+n*.035);osc.stop(start+.3);
    }
  } catch { /* Audio is optional; gameplay remains available. */ }
}

function renderBoard(board=game.board,frost=game.frost,cleared=[],dropping=false) {
  const focused=document.activeElement?.dataset.index;
  $('#board').innerHTML=board.map((tile,i)=>{
    const special=tile.special?` ${tile.special} special`:'';
    const classes=['tile',special,frost[i]?'frost':'',frost[i]>1?'frost-double':'',selected===i?'selected':'',cleared.includes(i)?'clearing':'',dropping?'dropping':''].join(' ');
    const label=`Row ${Math.floor(i/8)+1}, column ${i%8+1}: ${names[tile.kind]}${tile.special?', '+tile.special+' power':''}${frost[i]?', frost '+frost[i]:''}`;
    return `<button class="${classes}" data-index="${i}" aria-label="${label}" aria-pressed="${selected===i}" ${busy?'tabindex="-1"':''}>${icon(tile.kind)}${tile.special?`<span class="special-badge">${{line:'↔',column:'↕',burst:'✹',color:'✦'}[tile.special]}</span>`:''}</button>`;
  }).join('');
  if(!busy&&focused!==undefined) $(`[data-index="${focused}"]`)?.focus({preventScroll:true});
}
function renderStats() {
  const config=getLevel(game.level),region=regions[config.region];
  $('#coins').textContent=format(progress.coins);
  $('#score').textContent=format(game.score);$('#score-target').textContent=` / ${format(config.target)}`;
  $('#energy-progress').style.width=`${Math.min(100,game.score/config.target*100)}%`;
  $('#moves').textContent=game.moves;$('#level-number').textContent=String(game.level).padStart(2,'0');
  $('#level-title').textContent=config.name;$('#region-name').textContent=region.name;
  $('#region-progress').textContent=`Level ${(game.level-1)%20+1} of 20`;
  $('#world-progress').style.width=`${((game.level-1)%20+1)*5}%`;
  const frostLeft=game.frost.reduce((a,b)=>a+b,0);
  $('#objectives').innerHTML=(config.collect?`<div class="objective ${game.collected>=config.collect?'done':''}" title="Collect ${names[config.collectKind]}">${icon(config.collectKind)}<span>${Math.min(game.collected,config.collect)}/${config.collect}</span></div>`:'')+
    (config.frostCount?`<div class="objective ${!frostLeft?'done':''}" title="Frost layers remaining">${icon(4)}<span>❄ ${frostLeft}</span></div>`:'');
  $('#booster-count').textContent=`${2-game.boostersUsed} uses left this level`;
  $('#boosters').innerHTML=Object.entries(BOOSTERS).map(([type,price])=>`<button class="booster ${armed===type?'active':''}" data-booster="${type}" aria-pressed="${armed===type}" aria-label="${boosterNames[type]}, ${price} coins" ${busy||game.status!=='playing'||game.boostersUsed>=2||progress.coins<price?'disabled':''}><span class="booster-symbol">${boosterSymbols[type]}</span><span><span class="booster-name">${boosterNames[type]}</span><span class="booster-price"><span class="coin">ϟ</span>${price}</span></span></button>`).join('');
  for(const id of ['hint','restart','map-button','level-button']) $('#'+id).disabled=busy;
}
function startLevel(level) {
  if(busy||level>progress.unlocked) return;
  game=createGame(level,crypto.getRandomValues(new Uint32Array(1))[0]);
  attemptId=crypto.randomUUID();selected=null;armed=null;
  renderStats();renderBoard();
  status(storageAvailable?(level===1?'Swap neighbors to match 3 weather pieces.':'Meet every objective before your moves run out.'):'Storage unavailable: progress lasts only for this session.');
  closeDialog();
}

function showDialog(html) {
  if(!dialog.open) returnFocus=document.activeElement;
  $('#dialog-content').innerHTML=html;
  if(!dialog.open) dialog.showModal();
}
function closeDialog() { if(dialog.open) dialog.close(); }
dialog.addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus({preventScroll:true}));
$('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});

async function animate(result) {
  const focusIndex=document.activeElement?.dataset.index;
  busy=true; selected=null;armed=null;renderStats();
  for(const frame of result.frames) {
    renderBoard(frame.before,frame.frost,frame.cleared);sound(frame.wave);
    if(frame.wave>1||frame.cleared.length>=8) {
      const combo=$('#combo');combo.textContent=frame.wave>=3?'STORM SURGE!':frame.wave===2?'CHAIN REACTION!':'SKYBREAKER!';
      combo.classList.remove('show');void combo.offsetWidth;combo.classList.add('show');
    }
    await sleep(230);renderBoard(frame.after,game.frost,[],true);await sleep(140);
  }
  busy=false;renderBoard();renderStats();
  if(focusIndex!==undefined) $(`[data-index="${focusIndex}"]`)?.focus({preventScroll:true});
  if(result.shuffled) status('The winds shifted! Board reshuffled to keep the storm moving.');
  else status(result.frames.length>1?`${result.frames.length} cascades. That’s a storm worth chasing.`:'Nice match. Keep the energy flowing.');
  if(game.status==='won') finishWin();
  else if(game.status==='lost') showLoss();
}

function chooseTile(index) {
  if(busy||game.status!=='playing') return;
  if(armed) {
    const price=BOOSTERS[armed];
    if(progress.coins<price) {status('Not enough coins for that booster.');return;}
    const result=useBooster(game,armed,index);
    if(result.ok) {spendCoins(progress,price);save();animate(result);}
    return;
  }
  if(selected===null) {selected=index;renderBoard();return;}
  if(selected===index) {selected=null;renderBoard();return;}
  const a=selected;
  if(Math.abs(a%8-index%8)+Math.abs(Math.floor(a/8)-Math.floor(index/8))!==1) {selected=index;renderBoard();return;}
  const result=swap(game,a,index);
  selected=null;
  if(!result.ok) {status('That swap needs a match of 3. No move lost.');renderBoard();return;}
  animate(result);
}

$('#board').addEventListener('click',event=>{const tile=event.target.closest('[data-index]');if(tile&&!suppressClick)chooseTile(Number(tile.dataset.index));});
let pointer=null,suppressClick=false;
$('#board').addEventListener('pointerdown',event=>{
  const tile=event.target.closest('[data-index]');if(!tile||busy)return;
  pointer={id:event.pointerId,index:Number(tile.dataset.index),x:event.clientX,y:event.clientY};
});
$('#board').addEventListener('pointerup',event=>{
  if(!pointer||event.pointerId!==pointer.id)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y,p=pointer;pointer=null;
  if(Math.max(Math.abs(dx),Math.abs(dy))<18||armed)return;
  const target=p.index+(Math.abs(dx)>Math.abs(dy)?(dx>0?1:-1):(dy>0?8:-8));
  if(target<0||target>=64||Math.abs(p.index%8-target%8)+Math.abs(Math.floor(p.index/8)-Math.floor(target/8))!==1)return;
  suppressClick=true;setTimeout(()=>suppressClick=false,400);
  selected=p.index;chooseTile(target);
});
$('#board').addEventListener('pointercancel',()=>pointer=null);
$('#board').addEventListener('keydown',event=>{
  const tile=event.target.closest('[data-index]');
  if(!tile||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();const index=Number(tile.dataset.index),offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[event.key];
  const target=index+offset;
  if(target>=0&&target<64&&Math.abs(index%8-target%8)+Math.abs(Math.floor(index/8)-Math.floor(target/8))===1)$(`[data-index="${target}"]`)?.focus();
});
$('#boosters').addEventListener('click',event=>{
  const button=event.target.closest('[data-booster]');if(!button||button.disabled||busy)return;
  armed=armed===button.dataset.booster?null:button.dataset.booster;selected=null;renderStats();renderBoard();
  status(armed?`${boosterNames[armed]} armed. Tap a piece to use ${BOOSTERS[armed]} coins. Tap the booster again to cancel.`:'Booster canceled. No coins spent.');
});
$('#hint').addEventListener('click',()=>{
  if(busy||game.status!=='playing')return;
  const pair=legalMoves(game.board)[0];pair?.forEach(index=>$(`[data-index="${index}"]`).classList.add('hinted'));
  status('Try swapping the two glowing pieces.');
});

function finishWin() {
  const stars=starsFor(game),reward=awardWin(progress,game.level,stars,attemptId);save();renderStats();
  showWin(stars,reward,false);
}
function showWin(stars,reward,adDone) {
  const last=game.level===100;
  showDialog(`<span class="dialog-kicker">${last?'Expedition complete':'Forecast: phenomenal'}</span><h2 class="dialog-title">${last?'You are the storm.':'Storm mastered.'}</h2><div class="result-stars" aria-label="${stars} stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-stats"><div><b>${format(game.score)}</b><span>STORM ENERGY</span></div><div><b>+${reward}</b><span>COINS EARNED</span></div></div><p class="dialog-copy">${last?'All 100 levels cleared. Revisit your favorites and chase three stars.':'A little thunder goes a long way. Your next forecast is ready.'}</p><button id="next-level" class="primary-button">${last?'Explore the map':'Next level →'}</button>${adTestMode&&!adDone?'<button id="reward-ad" class="secondary-button">Test rewarded ad · double coins</button><span class="ad-label">QA SIMULATION · NO REAL AD</span>':''}<button id="replay" class="text-button">Replay this level</button>`);
  $('#next-level').onclick=()=>last?showMap():startLevel(game.level+1);
  $('#replay').onclick=()=>startLevel(game.level);
  if($('#reward-ad')) $('#reward-ad').onclick=()=>showTestAd(stars,reward);
}
function showTestAd(stars,reward) {
  showDialog('<span class="dialog-kicker">Developer ad placement</span><h2 class="dialog-title">Test rewarded ad</h2><p class="dialog-copy">This is an ad-flow simulator. No advertiser is loaded, and no real ad revenue is generated. Complete the test to verify the reward; cancel to receive nothing.</p><button id="complete-ad" class="primary-button">Simulate completed view</button><button id="cancel-ad" class="secondary-button">Cancel test</button>');
  $('#complete-ad').onclick=()=>{
    if(!progress.adClaimed.includes(attemptId)) {progress.coins+=reward;progress.adClaimed.push(attemptId);progress.adClaimed=progress.adClaimed.slice(-500);save();}
    renderStats();showWin(stars,reward*2,true);
  };
  $('#cancel-ad').onclick=()=>showWin(stars,reward,false);
}
function showLoss() {
  showDialog('<span class="dialog-kicker">Every storm starts somewhere</span><h2 class="dialog-title">Another spark?</h2><p class="dialog-copy">You ran out of moves. Look for matches of 4 or 5 to create powerful weather pieces. Retries are free.</p><button id="retry" class="primary-button">Try again ↻</button><button id="loss-map" class="secondary-button">Storm map</button>');
  $('#retry').onclick=()=>startLevel(game.level);$('#loss-map').onclick=showMap;
}
function showMap() {
  if(busy)return;
  showDialog(`<span class="dialog-kicker">Your expedition</span><h2 class="dialog-title">Chase the storm.</h2><p class="dialog-copy">Five worlds. One hundred forecasts.<br>${Object.keys(progress.stars).length} levels mastered · ${Object.values(progress.stars).reduce((a,b)=>a+b,0)} stars collected</p>${regions.map((region,r)=>`<section class="map-region"><h3 style="color:${region.color}">${String(r+1).padStart(2,'0')} / ${region.name}</h3><div class="map-grid">${levels.slice(r*20,r*20+20).map(level=>`<button class="map-level ${level.id===game.level?'current':''}" data-level="${level.id}" ${level.id>progress.unlocked?'disabled':''} aria-label="Level ${level.id}${level.id>progress.unlocked?', locked':''}">${level.id>progress.unlocked?'·':level.id}<small>${progress.stars[level.id]?'★'.repeat(progress.stars[level.id]):level.id>progress.unlocked?'LOCKED':'PLAY'}</small></button>`).join('')}</div></section>`).join('')}`);
  $('#dialog-content').querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>startLevel(Number(button.dataset.level)));
}
$('#map-button').onclick=showMap;$('#level-button').onclick=showMap;
$('#restart').onclick=()=>{
  if(busy)return;
  showDialog('<span class="dialog-kicker">Fresh forecast</span><h2 class="dialog-title">Restart this level?</h2><p class="dialog-copy">Your moves reset with a fresh board. Coins already spent on boosters won’t be refunded.</p><button id="confirm-restart" class="primary-button">Restart level</button><button id="cancel-restart" class="secondary-button">Keep playing</button>');
  $('#confirm-restart').onclick=()=>startLevel(game.level);$('#cancel-restart').onclick=closeDialog;
};
$('#settings').onclick=()=>{
  showDialog(`<span class="dialog-kicker">Tune your forecast</span><h2 class="dialog-title">Settings</h2><label class="setting">Sound effects<input id="sound-setting" type="checkbox" ${progress.settings.sound?'checked':''}></label><label class="setting">Animations<input id="motion-setting" type="checkbox" ${progress.settings.motion?'checked':''}></label><p class="dialog-copy">Progress saves on this device. ${prefersReducedMotion?'Your system’s reduced-motion preference is respected.':''}</p><p class="dialog-copy">Ads: ${adTestMode?'QA simulator enabled.':'not connected in this early build.'}<br>Real-money purchases: not available.</p>`);
  $('#sound-setting').onchange=event=>{progress.settings.sound=event.target.checked;save();sound();};
  $('#motion-setting').onchange=event=>{progress.settings.motion=event.target.checked;document.body.classList.toggle('reduced-motion',!progress.settings.motion);save();};
};
$('#help').onclick=()=>showDialog(`<span class="dialog-kicker">Field guide</span><h2 class="dialog-title">Make some thunder.</h2><p class="dialog-copy">Tap two neighboring pieces or swipe to swap them. Match 3 or more of the same kind. Invalid swaps never cost a move.</p><div class="legend-row">${icon(0)}<span>Match 4: create a lightning line.<br>Match 5: create a color blast.</span></div><div class="legend-row">${icon(3)}<span>Cross matches: create a 3×3 burst.<br>Match a powered piece to set it off.</span></div><div class="legend-row">${icon(4)}<span>Clear pieces on frost to melt its layers.<br>Complete the energy and collection goals.</span></div><p class="dialog-copy">Spend coins on up to 2 boosters per attempt. Hints and retries are free. First clears earn 30–45 coins; replays earn 5.</p>`);
$('#tip-icons').innerHTML=icon(0)+icon(3)+icon(2);
if(adTestMode)$('#build-label').textContent='QA BUILD · SIMULATED ADS';
document.body.classList.toggle('reduced-motion',!progress.settings.motion);
startLevel(progress.unlocked);
