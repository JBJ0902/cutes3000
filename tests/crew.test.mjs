import assert from 'node:assert/strict';
import {CREW,crewQuestion,CAFE_POSTS,CHEERS,SUPPORT,TROLLS} from '../dist/content.js';
import {fresh,resolve,nextDay,valid} from '../dist/engine.js';
assert.equal(CREW.length,13);assert.equal(new Set(CREW.map(x=>x[0])).size,13);
for(const [name,x,y,w,h] of CREW){assert(x>=0&&y>=0&&x+w<=837&&y+h<=840);for(let m=0;m<4;m++)for(let t=0;t<20;t++){const q=crewQuestion(m,name,t);assert.equal(q[0],name);assert.equal(q[2].length,3);assert(q[3]>=0&&q[3]<3);}}
for(const p of CAFE_POSTS)assert(p[2][p[3]]);
assert(CHEERS.length>=18&&SUPPORT.length>=8&&TROLLS.length>=6);
for(const id of ['cafe','sing'])for(const score of [0,.5,1]){let s={...fresh(),phase:'plan'};for(let d=0;d<46;d++){s=resolve(s,s.energy<20?'rest':id,score);assert(valid(s));s=nextDay(s);assert(valid(s));}}
console.log('PASS: 13 portrait/name mappings, 1040 crew questions, cafe answers, dialogue pools, six new activity campaigns');
