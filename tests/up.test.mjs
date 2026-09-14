import assert from 'node:assert/strict';
import {createContest,contestRows,contestOutcome,cleanChat,CREW_EXTRA,BALLOONS} from '../dist/expansion.js';
import {crewQuestion} from '../dist/content.js';
import {fresh,resolve,nextDay,valid} from '../dist/engine.js';
assert.equal(cleanChat('왕십리별: “바빴는데 이제 왔어요!”'),'“바빴는데 이제 왔어요!”');
assert.equal(cleanChat('오늘도 함께해요!'),'오늘도 함께해요!');
for(let m=0;m<4;m++){assert.equal(CREW_EXTRA[m].length,10);assert.equal(new Set(Array.from({length:12},(_,i)=>crewQuestion(m,'박재박',i)[1])).size,12);}
assert.equal(BALLOONS.length,12);
for(const r of [0,.25,.5,.99999]){
 const c=createContest(()=>r);assert(c.seconds>=18&&c.seconds<=28);assert.equal(c.opponents.length,6);
 assert.equal(contestOutcome(c,0).qualified,false);assert.equal(contestOutcome(c,10000).rank,1);
 const scores=contestRows(c,c.seconds,0).filter(x=>x.id!==0).map(x=>x.up);const cutoff=scores[2];
 assert.equal(contestOutcome(c,cutoff).qualified,false);assert.equal(contestOutcome(c,cutoff+1).qualified,true);
 for(let t=1;t<=c.seconds;t++){const prev=contestRows(c,t-1,0);for(const row of contestRows(c,t,0))assert(row.up>=prev.find(x=>x.id===row.id).up);}
}
for(const score of [0,.5,1]){let s={...fresh(),phase:'plan'};for(let d=0;d<46;d++){s=resolve(s,s.energy<20?'rest':'up',score);assert(valid(s));s=nextDay(s);assert(valid(s));}}
console.log('PASS: rank/tie cutoffs, 18–28 seconds, monotonic rivals, 48 questions, 12 balloon types, duplicate names, UP save progression');
