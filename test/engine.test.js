import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../web/engine.js';
import { getLevel, levels } from '../web/levels.js';

test('all 100 levels start settled, full, and with a legal move', () => {
  assert.equal(levels.length, 100);
  for (let level = 1; level <= 100; level++) {
    const game = engine.createGame(level, level * 17);
    assert.equal(game.board.length, 64);
    assert.ok(game.board.every(t => t && t.kind >= 0 && t.kind < getLevel(level).colors));
    assert.equal(engine.findMatches(game.board).length, 0);
    assert.ok(engine.legalMoves(game.board).length > 0);
  }
});
test('illegal swaps leave board and moves untouched, including wrapped rows', () => {
  const game = engine.createGame(1, 42);
  const before = structuredClone(game);
  for (const pair of [[7,8], [0,63], [-1,0], [1,1]]) {
    assert.equal(engine.swap(game, ...pair).ok, false);
    assert.deepEqual(game, before);
  }
  const valid = new Set(engine.legalMoves(game.board).map(p => p.join(',')));
  const bad = Array.from({length:7}, (_,i)=>[i,i+1]).find(p=>!valid.has(p.join(',')));
  if (bad) { assert.equal(engine.swap(game,...bad).ok,false); assert.deepEqual(game,before); }
});
test('a legal move spends one move, scores, resolves cascades and leaves a playable board', () => {
  const game = engine.createGame(1, 123);
  const moves = game.moves;
  const result = engine.swap(game, ...engine.legalMoves(game.board)[0]);
  assert.equal(result.ok, true);
  assert.equal(game.moves, moves - 1);
  assert.ok(game.score >= 150);
  assert.ok(result.frames.length > 0);
  assert.equal(engine.findMatches(game.board).length, 0);
  assert.ok(engine.legalMoves(game.board).length);
});
test('horizontal and vertical intersections are detected without row wrapping', () => {
  const board = Array.from({length:64},(_,i)=>({kind:(i+Math.floor(i/8))%6}));
  for (const i of [18,19,20,11,27]) board[i]={kind:5};
  const matches=engine.findMatches(board);
  assert.ok(matches.some(m=>m.includes(18)&&m.includes(19)&&m.includes(20)));
  assert.ok(matches.some(m=>m.includes(11)&&m.includes(19)&&m.includes(27)));
});
test('boosters validate targets, clear chunks, and enforce two uses', () => {
  const game = engine.createGame(41, 42);
  const before=structuredClone(game);
  assert.equal(engine.useBooster(game,'burst',-1).ok,false);
  assert.deepEqual(game,before);
  assert.equal(engine.useBooster(game,'burst',27).ok,true);
  assert.equal(game.boostersUsed,1);
  assert.ok(game.score>=450);
  assert.equal(engine.useBooster(game,'pin',0).ok,true);
  assert.equal(engine.useBooster(game,'line',0).ok,false);
  assert.equal(game.moves,before.moves);
});
test('last move can win; a finished level rejects further actions', () => {
  const game = engine.createGame(1,42);
  game.moves=1; game.score=100000; game.collected=100000; game.frost.fill(0);
  assert.equal(engine.swap(game,...engine.legalMoves(game.board)[0]).ok,true);
  assert.equal(game.status,'won');
  const before=structuredClone(game);
  assert.equal(engine.swap(game,0,1).ok,false);
  assert.equal(engine.useBooster(game,'pin',0).ok,false);
  assert.deepEqual(game,before);
});
test('unmet objectives at zero moves lose', () => {
  const game=engine.createGame(100,33); game.moves=1;
  engine.swap(game,...engine.legalMoves(game.board)[0]);
  assert.equal(game.status,'lost');
});
test('color special swapped with an adjacent piece clears that color', () => {
  const game=engine.createGame(21,35);
  game.board[0].special='color';
  const kind=game.board[1].kind;
  const expected=game.board.flatMap((t,i)=>i===0?[1]:i===1?[0]:t.kind===kind?[i]:[]);
  const result=engine.swap(game,0,1);
  assert.equal(result.ok,true);
  assert.deepEqual([...result.frames[0].cleared].sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
});
test('frost is removed when its occupying piece is cleared', () => {
  const game=engine.createGame(21,55);
  const target=game.frost.findIndex(x=>x>0);
  const before=game.frost[target];
  engine.useBooster(game,'pin',target);
  assert.ok(game.frost[target]<before);
});
test('four and five matches create line and color specials respectively',()=>{
  for(const [length,power] of [[4,'line'],[5,'color']]){
    const game=engine.createGame(41,123);
    game.board=Array.from({length:64},(_,i)=>({kind:(i%8+Math.floor(i/8)*2)%6}));
    for(let i=0;i<length;i++)game.board[i]={kind:0};
    game.board[2]={kind:1};game.board[10]={kind:0};
    const result=engine.swap(game,10,2);
    assert.equal(result.ok,true);
    assert.ok(result.frames[0].after.some(t=>t.special===power));
  }
});
test('100 levels survive varied ten-move gameplay sequences with full settled boards',()=>{
  for(let level=1;level<=100;level++)for(const seed of [1,97,901]){
    const game=engine.createGame(level,seed);
    for(let turn=0;turn<10&&game.status==='playing';turn++){
      const choices=engine.legalMoves(game.board);
      assert.ok(choices.length,`level ${level}, seed ${seed}: playable`);
      const result=engine.swap(game,...choices[(turn+seed)%choices.length]);
      assert.equal(result.ok,true);
      assert.equal(engine.findMatches(game.board).length,0);
      assert.ok(game.board.every(Boolean));
      assert.ok(game.moves>=0);
    }
  }
});
