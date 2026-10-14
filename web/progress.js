export const SAVE_KEY='weather-workshop-v1';
export const freshProgress = () => ({version:1,coins:150,unlocked:1,stars:{},claimed:[],adClaimed:[],settings:{sound:false,motion:true}});
const bounded=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;

export function parseProgress(text) {
  const fallback=freshProgress();
  try {
    const raw=JSON.parse(text);
    if(raw?.version!==1) return fallback;
    const stars={};
    for(const [key,value] of Object.entries(raw.stars??{})) if(bounded(Number(key),1,100)&&bounded(value,1,3)) stars[key]=value;
    let unlocked=1;
    while(unlocked<100&&stars[unlocked]) unlocked++;
    return {...fallback, coins:bounded(raw.coins,0,10000000)?raw.coins:150,unlocked,stars,
      claimed:Array.isArray(raw.claimed)?raw.claimed.filter(x=>typeof x==='string').slice(-500):[],
      adClaimed:Array.isArray(raw.adClaimed)?raw.adClaimed.filter(x=>typeof x==='string').slice(-500):[],
      settings:{sound:raw.settings?.sound===true,motion:raw.settings?.motion!==false}};
  } catch { return fallback; }
}

export function awardWin(progress,level,stars,attemptId) {
  if(!bounded(level,1,progress.unlocked)||!bounded(stars,1,3)||typeof attemptId!=='string'||!attemptId||progress.claimed.includes(attemptId)) return 0;
  const reward=progress.stars[level]?5:30+stars*5;
  progress.stars[level]=Math.max(progress.stars[level]??0,stars);
  progress.unlocked=Math.min(100,Math.max(progress.unlocked,level+1));
  progress.coins+=reward;
  progress.claimed.push(attemptId); progress.claimed=progress.claimed.slice(-500);
  return reward;
}

export function spendCoins(progress,price) {
  if(!Number.isSafeInteger(price)||price<=0||progress.coins<price) return false;
  progress.coins-=price; return true;
}
