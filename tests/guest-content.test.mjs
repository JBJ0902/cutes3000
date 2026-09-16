import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../dist/engine.js';
import {GUEST_CONTENTS,guestEffectText,applyGuestChoice} from '../dist/guest-content.js';

test('합방 콘텐츠 6종에 선택지 2개씩 총 12개가 있고 모두 보상과 체력 비용을 가짐',()=>{
 const contents=Object.values(GUEST_CONTENTS);assert.equal(contents.length,6);
 const choices=contents.flatMap(content=>content.choices);assert.equal(choices.length,12);
 for(const content of contents){assert.equal(content.choices.length,2);assert.equal(new Set(content.choices.map(choice=>choice.id)).size,2);}
 for(const choice of choices){
  assert(choice.effects.energy<0,choice.label);assert(choice.effects.favorites>=1,choice.label);
  assert(Object.entries(choice.effects).some(([key,value])=>key!=='energy'&&value>0),choice.label);
  const label=guestEffectText(choice.effects);for(const value of Object.values(choice.effects))assert(label.includes(value>0?`+${value}`:String(value)));
 }
});

test('합방 선택 효과는 실제 수치에 한 번 적용되고 0~100 경계를 넘지 않음',()=>{
 for(const [name,content] of Object.entries(GUEST_CONTENTS))for(const choice of content.choices){
  const state=fresh();Object.assign(state,{loyal:99,favorites:99,hype:99,energy:1,mood:99,dayMoodChange:0});
  const result=applyGuestChoice(state,name,choice.id);assert.equal(result.id,choice.id);
  for(const key of ['loyal','favorites','hype','energy','mood'])assert(state[key]>=0&&state[key]<=100,`${name}/${choice.id}/${key}`);
  assert.equal(state.energy,Math.max(0,1+choice.effects.energy));
 }
});

test('알 수 없는 합방 선택은 거절하고 UI는 데이터 기반·중복 완료 방지',()=>{
 assert.throws(()=>applyGuestChoice(fresh(),'없는 콘텐츠','team'),/Unknown guest content choice/);
 const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 assert(app.includes('Object.keys(GUEST_CONTENTS)'));assert(app.includes('scene.choices.map'));
 assert(app.includes('if(used)return;used=true'));assert(!app.includes("id=\"guest-team\""));assert(!app.includes("id=\"guest-bold\""));
 assert.match(app,/audience\.context\('result',id,resultDetail\)/);
 assert.match(app,/주문 \$\{photo\.orders\}\/6 성공/);
 assert(!/resultDetail=.*별풍선 \+\$\{photo\.balloons\}/.test(app));
 assert(app.includes("audience.context('photo-sale-balloon','photo')"));
});
