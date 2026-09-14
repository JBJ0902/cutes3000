import assert from 'node:assert/strict';
import {createSong,advanceSong,songHit} from '../dist/song-game.js';
const s=createSong(()=>.5);let low=1,high=0;
for(let i=0;i<3500;i++){advanceSong(s,.01);low=Math.min(low,s.left);high=Math.max(high,s.left);assert(s.left>=0&&s.left+s.width<=1.000001);}
assert(low<.001&&high>.799);
for(const left of [0,.17,.4,.8]){s.left=left;s.note=left+.1;assert.equal(songHit(s),1);s.note=left===0?.5:0;assert.equal(songHit(s),0);}
console.log('PASS song: full width, bounds, visible target hit/miss at center and edges');
