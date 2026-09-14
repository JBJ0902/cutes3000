import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh,valid,resolve,nextDay,VIEWERS,trendActivity,allowed} from '../dist/engine.js';
import {ensureAudience,validAudience,online,ranking,chatInterval,targetViewers,tickAudience,donate,reply,abuse,moderate,supportFactor,contextChat,say} from '../dist/audience.js';
const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const start=(seed=1)=>{const s=fresh();s.phase='plan';s.playerName='검증';ensureAudience(s,VIEWERS,rng(seed));return s;};
const advance=(s,n,r=rng(2))=>{for(let i=0;i<n;i++)tickAudience(s,1,{running:true},r);};
test('명부의 닉네임/ID 고유성, 실제 접속 인원, 기존 이름 보존',()=>{
 const s=start(),a=s.audience;assert(a.people.length>=320);assert.equal(new Set(a.people.map(v=>v.name)).size,a.people.length);assert.equal(new Set(a.people.map(v=>v.id)).size,a.people.length);for(const v of VIEWERS)assert(a.people.some(p=>p.name===v.name.normalize('NFC')));assert.equal(online(a).length,targetViewers(s));assert.equal(ranking(a).length,20);assert.equal(a.people.filter(v=>v.tier==='elite').length,20);assert(valid(s));
});
test('인원이 많으면 채팅 간격 감소, 화제성 목표 인원은 단조 증가',()=>{
 const s=start();let prev=0;for(let hype=0;hype<=100;hype++){s.hype=hype;assert(targetViewers(s)>=prev);prev=targetViewers(s);}assert(chatInterval(10)>chatInterval(50));assert(chatInterval(50)>chatInterval(100));assert(chatInterval(180)>=1.5);
});
test('일시정지/결과/엔딩에서는 논리 시간, 보상, 명부 모두 정지',()=>{
 for(const phase of ['plan','result','end','graduated']){const s=start();s.phase=phase;const before=JSON.stringify(s);for(let i=0;i<100;i++)tickAudience(s,1,{running:phase!=='plan'});assert.equal(JSON.stringify(s),before);}
});
test('강퇴 즉시 인원 감소, 45~75초 후 동일 ID/닉네임 재입장',()=>{
 const s=start(),a=s.audience,v=online(a)[0],n=online(a).length,l=s.loyal;assert(moderate(s,v.id,'kick',()=>0).ok);assert.equal(online(a).length,n-1);assert.equal(s.loyal,l-1);advance(s,44);assert(!v.online);advance(s,4);assert(v.online);assert(a.messages.some(m=>m.kind==='return'&&m.viewerId===v.id));
});
test('최근 악플 관리만 충성도 증가 / 동일 인물 반복 보상 방지',()=>{
 const s=start(),a=s.audience,v=online(a)[0];abuse(s,v,'테스트 악플');const before=s.loyal;moderate(s,v.id,'kick',()=>0);assert.equal(s.loyal,before+1);advance(s,48);abuse(s,v,'테스트 악플');moderate(s,v.id,'kick');assert.equal(a.day.goodMods,1);
});
test('차단/해제 정확한 즐겨찾기 차감·복원과 중복 해제 방지',()=>{
 const s=start(),a=s.audience,v=online(a)[0],fav=s.favorites;abuse(s,v,'테스트');moderate(s,v.id,'block');assert.equal(s.favorites,fav-1);advance(s,200);assert(!v.online);assert(!online(a).some(p=>p.id===v.id));moderate(s,v.id,'unblock');assert.equal(s.favorites,fav);assert(!moderate(s,v.id,'unblock').ok);advance(s,3);assert(v.online);
 s.favorites=0;moderate(s,v.id,'block');assert.equal(v.refundable,0);moderate(s,v.id,'unblock');assert.equal(s.favorites,0);
});
test('일반/악플 관리 효과는 각각 하루 네 명 상한',()=>{
 const s=start(),a=s.audience;for(const v of online(a).slice(0,8)){abuse(s,v,'테스트');moderate(s,v.id,'block');}assert.equal(a.day.goodMods,4);assert.equal(s.loyal,34);for(const v of online(a).slice(0,8))moderate(s,v.id,'kick');assert.equal(a.day.badMods,4);assert.equal(s.loyal,30);
});
test('차단 중 활동으로 즐겨찾기가 올라가도 해제 복원량 보전',()=>{
 let s=start();s.favorites=100;const id=online(s.audience)[0].id;moderate(s,id,'block');assert.equal(s.favorites,99);s=resolve(s,'chat',1);assert(s.favorites<=99);s=nextDay(s);const before=s.favorites;moderate(s,id,'unblock');assert.equal(s.favorites,before+1);assert(s.favorites<=100);
});
test('악플 방치: 충성도/기분 감소, 화제성 증가, 후원 억제 및 하루 상한',()=>{
 const s=start();s.audience.nextGiftAt=1e8;const v=online(s.audience)[0];const normal=supportFactor(s),hype=s.hype;abuse(s,v,'테스트');for(let i=0;i<61;i++)tickAudience(s,1,{running:true},()=>.99);assert.equal(s.loyal,27);assert.equal(s.hype,hype+3);assert.equal(s.mood,54);assert(supportFactor(s)<normal);assert.equal(s.audience.day.penalties,3);advance(s,600);assert.equal(s.audience.day.penalties,3);
});
test('기분이 낮을 때 추가 체력 감소는 하루 최대 2',()=>{
 const s=start();s.mood=20;const e=s.energy;s.audience.nextGiftAt=1e8;advance(s,200);assert.equal(s.energy,e-2);assert.equal(s.audience.day.stress,2);
});
test('후원 지급/기록은 한 번, 하루 최대 세 번·120개',()=>{
 const s=start(),a=s.audience,v=online(a)[0],b=s.balloons,d=v.donated;const g=donate(s,v,70);donate(s,v,70);assert.equal(s.balloons,b+120);assert.equal(v.donated,d+120);assert.equal(donate(s,v,1),null);assert.equal(a.messages.filter(m=>m.kind==='donation').length,2);assert.equal(a.gifts[0].id,g.id);assert(s.eventLog.some(e=>e.after.balloons-e.before.balloons===70));assert(valid(s));
});
test('신규 후원자 감사 답변 승급, 같은 선물로 반복 승급 없음',()=>{
 const s=start(),a=s.audience,v=a.people.find(v=>v.tier==='new');v.online=true;const g=donate(s,v,1,()=>.99);assert.equal(v.tier,'new');assert(reply(s,'ㅍㄴㅍㄴ',g.id,()=>0).ok);assert.equal(v.tier,'fan');assert(g.thanked);const n=a.messages.filter(m=>m.kind==='promotion').length;a.time+=3;reply(s,'ㅇㅇㄱ',g.id,()=>0);assert.equal(a.messages.filter(m=>m.kind==='promotion').length,n);
});
test('60초 초과/차단된 후원자는 답변 승급 대상 제외',()=>{
 for(const blocked of [false,true]){const s=start(),a=s.audience,v=a.people.find(v=>v.tier==='new');v.online=true;const g=donate(s,v,1,()=>.99);if(blocked)moderate(s,v.id,'block');else a.time+=61;reply(s,'ㅇㅇㄱ',g.id,()=>0);assert.equal(v.tier,'new');}
});
test('별풍 누적 상위20 진입·탈락 시 등급 일치',()=>{
 const s=start(),a=s.audience,v=a.people.find(v=>v.tier==='new');v.online=true;v.donated=200;donate(s,v,1,()=>.99);assert.equal(ranking(a)[0].id,v.id);assert.equal(v.tier,'elite');assert.equal(a.people.filter(v=>v.tier==='elite').length,20);
});
test('상황별 채팅과 메시지 최대80개, 닉네임 동일',()=>{
 const s=start(),a=s.audience;for(const t of ['sing','rhythm','clip','game','up','collab','photo','cafe','chat','memory']){contextChat(s,'start',t);assert.equal(a.topic,t);assert(a.messages.at(-1).kind==='context');}for(let i=0;i<100;i++)say(a,online(a)[0],'채팅'+i);assert.equal(a.messages.length,80);assert(a.messages.every(m=>a.people.find(v=>v.id===m.viewerId).name===m.name));
});
test('관심 콘텐츠의 신규 시청자 체류 시간 증가',()=>{
 const a=start(),b=structuredClone(a);for(const s of [a,b]){s.hype=0;s.loyal=0;s.audience.people.forEach(v=>{v.online=v.tier==='new';v.entered=0;});s.audience.topic='sing';s.audience.nextGiftAt=1e8;}a.audience.people.forEach(v=>v.interests=['sing']);b.audience.people.forEach(v=>v.interests=['game']);advance(a,90,()=>.99);advance(b,90,()=>.99);assert(online(a.audience).length>online(b.audience).length);
});
test('오래된 저장 이관, JSON 왕복, 잘못된 명부 입력 거절',()=>{
 const s=fresh();assert(valid(s));s.phase='plan';ensureAudience(s,VIEWERS);const saved=JSON.parse(JSON.stringify(s));assert(valid(saved));saved.audience.people[1].id=saved.audience.people[0].id;assert(!valid(saved));assert(!validAudience({version:1}));
});
test('100개 시드 46일 진행: 수치 범위·유효 저장·온라인/차단·상위20 불변식',()=>{
 for(let seed=1;seed<=100;seed++){let s=start(seed);const r=rng(seed);for(let d=0;d<46;d++){advance(s,75,r);const bad=online(s.audience).find(v=>v.abuseUntil>s.audience.time);if(bad&&seed%2)moderate(s,bad.id,'kick',r);assert(valid(s),`seed ${seed} day ${d}`);assert(online(s.audience).length<=180);assert.equal(ranking(s.audience).length,20);assert.equal(s.audience.people.filter(v=>v.tier==='elite').length,20);assert(s.audience.day.balloons<=120);s=nextDay(resolve(s,s.energy<25?'rest':['sing','game','clip','chat'][d%4],.8));assert(valid(s));}}
});
test('화면 통합 지점/게임 일시정지/기존 이중 후원 타이머 제거 확인',()=>{
 const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),ui=readFileSync(new URL('../dist/audience-ui.js',import.meta.url),'utf8'),photo=readFileSync(new URL('../dist/gallery-ui.js',import.meta.url),'utf8');assert(!app.includes('function starOrTroll'));assert(!app.includes('ambientChatIndex'));assert(app.includes('return audience.compactHTML()'));assert(app.includes('audience.feedHTML()'));assert(app.includes('audience.paused()'));assert(photo.includes('!paused()'));assert(ui.includes('data-message-id'));assert(ui.includes("data().messages.slice(-3).map(line)"));assert(ui.includes("data().messages.slice(-30).map(line)"));
});
test('TREND와 크루 합방 해금은 동일한 날짜 기준을 사용',()=>{
 const s=fresh();s.phase='plan';s.energy=80;s.loyal=60;
 s.day=7;assert.equal(trendActivity(s),'game');assert(!allowed(s,'collab'));
 s.day=8;assert.equal(trendActivity(s),'collab');assert(allowed(s,'collab'));assert.equal(resolve(s,'collab',.8).pending.trend,5);
 s.energy=24;assert(!allowed(s,'collab'));assert.notEqual(trendActivity(s),'collab');
 s.energy=25;s.loyal=34;assert(!allowed(s,'collab'));assert.notEqual(trendActivity(s),'collab');
 s.loyal=35;assert(allowed(s,'collab'));assert.equal(trendActivity(s),'collab');
});
