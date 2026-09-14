import assert from 'node:assert/strict';
import {ACTIONS,fresh,valid,resolve,nextDay,storyChoice,STORIES,allowed,ending,dateLabel} from '../dist/engine.js';
assert.equal(dateLabel(0),'8월 16일');assert.equal(dateLabel(45),'9월 30일');
let initial=fresh();assert(valid(initial));initial.phase='plan';assert.equal(initial.followers,2300);assert.throws(()=>resolve(initial,'collab'));assert.throws(()=>resolve(initial,'unknown'));
let first=resolve(initial,'game',.5);assert(valid(first));assert.equal(initial.followers,2300);assert.throws(()=>resolve(first,'game'));assert(valid(JSON.parse(JSON.stringify(first))));
assert(!valid({...first,pending:null}));assert(!valid({...initial,phase:'end'}));assert(!valid({...initial,followers:NaN}));
let storyState={...initial,day:7};let a=storyChoice(storyState,0);assert.deepEqual(storyChoice(a,0),a);
const summary=[];
for(const [name,policy,score] of [
 ['balanced',s=>s.energy<28?'rest':s.loyal<60?'chat':allowed(s,'collab')&&s.last!=='collab'?'collab':s.day%2?'clip':'game',.65],
 ['simple',s=>s.energy<28?'rest':s.loyal<60?'chat':allowed(s,'collab')&&s.last!=='collab'?'collab':s.day%2?'clip':'game',.4],
 ['expert',s=>s.energy<28?'rest':s.loyal<60?'chat':allowed(s,'collab')&&s.last!=='collab'?'collab':s.day%2?'clip':'game',1],
 ['repeat',s=>'game',.7],['rest-only',s=>'rest',0]
]){let s=fresh();s.phase='plan';let checkpoint;for(let day=0;day<46;day++){if(day===39)checkpoint=structuredClone(s);if(STORIES[day])s=storyChoice(s,1);s=resolve(s,policy(s),score);assert(valid(s));assert.equal(s.phase,'result');s=nextDay(s);assert(valid(s));}assert.equal(s.day,46);assert.equal(s.phase,'end');assert.equal(s.log.length,46);assert.throws(()=>resolve(s,'game'));assert(valid(checkpoint));assert.equal(checkpoint.day,39);if(['balanced','simple','expert'].includes(name))assert(s.followers>=3000);else assert(s.followers<3000);summary.push({name,followers:s.followers,ending:ending(s).title});}
for(const [followers,loyal,title] of [[2899,80,'털의 재도전'],[2900,80,'조금만 더였는데'],[2999,80,'조금만 더였는데'],[3000,80,'살아남았다!'],[3300,69,'살아남았다!'],[3300,70,'이제 시작이야']])assert.equal(ending({followers,loyal}).title,title);
console.log(JSON.stringify(summary,null,2));console.log('PASS: dates, immutability, action gates, import validation, duplicate story guard, 5 full runs, checkpoint, all ending boundaries.');
