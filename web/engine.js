import { getLevel } from './levels.js';

export const SIZE = 8;
export const BOOSTERS = Object.freeze({ pin: 120, burst: 240, line: 300 });
const inside = i => Number.isInteger(i) && i >= 0 && i < 64;
const adjacent = (a,b) => inside(a) && inside(b) &&
  Math.abs(a % 8 - b % 8) + Math.abs(Math.floor(a / 8) - Math.floor(b / 8)) === 1;

function random(game) {
  game.seed = (Math.imul(game.seed, 1664525) + 1013904223) >>> 0;
  return game.seed / 4294967296;
}
const tile = game => ({ kind: Math.floor(random(game) * getLevel(game.level).colors) });

export function findMatches(board) {
  const groups = [];
  for (const vertical of [false, true]) {
    for (let line = 0; line < 8; line++) {
      let run = [];
      for (let offset = 0; offset <= 8; offset++) {
        const i = vertical ? offset * 8 + line : line * 8 + offset;
        if (offset < 8 && board[i] && (!run.length || board[i].kind === board[run[0]].kind)) run.push(i);
        else {
          if (run.length >= 3) groups.push(run);
          run = offset < 8 && board[i] ? [i] : [];
        }
      }
    }
  }
  return groups;
}

export function legalMoves(board) {
  const result = [];
  for (let a = 0; a < 64; a++) {
    for (const b of [a+1,a+8]) {
      if (!adjacent(a,b)) continue;
      if (board[a]?.special === 'color' || board[b]?.special === 'color') { result.push([a,b]); continue; }
      [board[a],board[b]] = [board[b],board[a]];
      const matched = findMatches(board).some(group => group.includes(a) || group.includes(b));
      [board[a],board[b]] = [board[b],board[a]];
      if (matched) result.push([a,b]);
    }
  }
  return result;
}

function freshBoard(game) {
  const board = [];
  for (let i=0;i<64;i++) {
    const forbidden = new Set();
    if (i%8>=2 && board[i-1].kind===board[i-2].kind) forbidden.add(board[i-1].kind);
    if (i>=16 && board[i-8].kind===board[i-16].kind) forbidden.add(board[i-8].kind);
    const choices = Array.from({length:getLevel(game.level).colors},(_,j)=>j).filter(j=>!forbidden.has(j));
    board.push({kind:choices[Math.floor(random(game)*choices.length)]});
  }
  game.board=board;
}

function ensurePlayable(game) {
  if (legalMoves(game.board).length) return false;
  const original=structuredClone(game.board);
  for(let attempt=0;attempt<100;attempt++) {
    game.board=structuredClone(original);
    for(let i=63;i>0;i--) {
      const j=Math.floor(random(game)*(i+1));
      [game.board[i],game.board[j]]=[game.board[j],game.board[i]];
    }
    if (!findMatches(game.board).length && legalMoves(game.board).length) return true;
  }
  // Extremely rare recovery: bounded regeneration, retaining the frost layout.
  freshBoard(game);
  game.board[0]={kind:0}; game.board[1]={kind:1}; game.board[2]={kind:0}; game.board[9]={kind:0};
  return true;
}

export function createGame(level, seed = Date.now()) {
  const config=getLevel(level);
  const game={ level, seed:seed>>>0, board:[], frost:Array(64).fill(0), moves:config.moves,
    score:0, collected:0, boostersUsed:0, status:'playing' };
  freshBoard(game); ensurePlayable(game);
  // An odd stride visits every cell exactly once.
  for(let n=0;n<config.frostCount;n++) game.frost[(level*7+n*19)%64]=config.frostLayers;
  return game;
}

function area(index, type) {
  const row=Math.floor(index/8), col=index%8;
  return Array.from({length:64},(_,i)=>i).filter(i=>type==='line' ? Math.floor(i/8)===row :
    type==='column' ? i%8===col : type==='burst' ? Math.abs(Math.floor(i/8)-row)<=1 && Math.abs(i%8-col)<=1 : i===index);
}

function newSpecials(groups, preferred) {
  const creations=new Map(), visited=new Set();
  for(let g=0;g<groups.length;g++) {
    if(visited.has(g)) continue;
    const component=new Set(groups[g]); visited.add(g);
    let grew=true;
    while(grew) { grew=false;
      for(let j=0;j<groups.length;j++) if(!visited.has(j)&&groups[j].some(i=>component.has(i))) {
        groups[j].forEach(i=>component.add(i)); visited.add(j); grew=true;
      }
    }
    const linked=groups.filter(group=>group.some(i=>component.has(i)));
    const longest=Math.max(...linked.map(x=>x.length));
    const special=longest>=5?'color':linked.length>1?'burst':longest===4?(groups[g][1]-groups[g][0]===1?'line':'column'):null;
    if(special) creations.set(preferred.find(i=>component.has(i)) ?? [...component][Math.floor(component.size/2)],special);
  }
  return creations;
}

function resolve(game, initial=null, preferred=[], activatedColor=null) {
  const frames=[]; let forced=initial;
  for(let wave=0;wave<50;wave++) {
    const groups=forced?[]:findMatches(game.board);
    if(!forced&&!groups.length) break;
    const creations=forced?new Map():newSpecials(groups,preferred);
    const cleared=new Set(forced??groups.flat()); forced=null;
    // Expand triggered specials recursively; each tile triggers at most once.
    for(const i of cleared) {
      const t=game.board[i];
      if(!t?.special||(wave===0&&i===activatedColor)) continue;
      const cells=t.special==='color' ? game.board.flatMap((x,j)=>x.kind===t.kind?[j]:[]) : area(i,t.special);
      cells.forEach(j=>cleared.add(j));
    }
    const before=structuredClone(game.board), frostBefore=[...game.frost];
    for(const i of cleared) {
      if(game.board[i].kind===getLevel(game.level).collectKind) game.collected++;
      if(game.frost[i]>0) game.frost[i]--;
      game.board[i]=null;
    }
    for(const [i,special] of creations) game.board[i]={kind:before[i].kind,special};
    game.score+=cleared.size*50*Math.min(wave+1,5);
    for(let col=0;col<8;col++) {
      const remaining=[];
      for(let row=7;row>=0;row--) if(game.board[row*8+col]) remaining.push(game.board[row*8+col]);
      for(let row=7;row>=0;row--) game.board[row*8+col]=remaining.shift()??tile(game);
    }
    frames.push({before,frost:frostBefore,cleared:[...cleared],after:structuredClone(game.board),wave:wave+1,score:game.score});
    preferred=[];
  }
  // Bound pathological cascades. Newly generated recovery tiles award no score.
  if(findMatches(game.board).length) freshBoard(game);
  const shuffled=ensurePlayable(game);
  const config=getLevel(game.level);
  if(game.score>=config.target&&game.collected>=config.collect&&!game.frost.some(Boolean)) game.status='won';
  else if(game.moves<=0) game.status='lost';
  return {ok:true,frames,shuffled};
}

export function swap(game,a,b) {
  if(game.status!=='playing'||!adjacent(a,b)) return {ok:false};
  const colorIndex=game.board[a].special==='color'?a:game.board[b].special==='color'?b:null;
  const other=colorIndex===a?b:a, kind=game.board[other]?.kind;
  [game.board[a],game.board[b]]=[game.board[b],game.board[a]];
  if(colorIndex===null&&!findMatches(game.board).some(g=>g.includes(a)||g.includes(b))) {
    [game.board[a],game.board[b]]=[game.board[b],game.board[a]];
    return {ok:false};
  }
  game.moves--;
  const forced=colorIndex===null?null:game.board.flatMap((t,i)=>t.kind===kind||i===other?[i]:[]);
  return resolve(game,forced,[b,a],colorIndex===null?null:other);
}

export function useBooster(game,type,index) {
  if(game.status!=='playing'||game.boostersUsed>=2||!Object.hasOwn(BOOSTERS,type)||!inside(index)) return {ok:false};
  game.boostersUsed++;
  return resolve(game,area(index,type));
}

export function starsFor(game) {
  if(game.status!=='won') return 0;
  const fraction=game.moves/getLevel(game.level).moves;
  return fraction>=0.3?3:fraction>=0.12?2:1;
}
