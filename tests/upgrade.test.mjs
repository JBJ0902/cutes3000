import assert from 'node:assert/strict';
import {fresh,resolve,nextDay,valid,ACTIONS} from '../dist/engine.js';
import {readFileSync,statSync} from 'node:fs';
for(const id of ['rhythm','memory']){
 assert(ACTIONS.some(a=>a.id===id));
 for(const score of [0,.5,1]){let s={...fresh(),phase:'plan'};for(let day=0;day<46;day++){s=resolve(s,s.energy<20?'rest':id,score);assert(valid(s));s=nextDay(s);assert(valid(s));}assert.equal(s.phase,'end');}
}
for(let i=1;i<=7;i++)assert(statSync(new URL('../dist/assets/music/track-'+i+'.mp3',import.meta.url)).size>1000);
const js=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert(js.includes("stop.onclick=()=>finish(id,ratio)"));
assert(js.includes("setFace(good?2:5"));
assert(!js.includes('data-do="dev"'));
console.log('PASS: new activities, 6 full campaigns, save validation, seven music assets, round scoring and face hooks');
