import * as core from './core-engine.js';
import {validAudience,reserveFavorites} from './audience.js';
export * from './core-engine.js';
export const VERSION=2;
const cap=core.clamp;
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function normalizeName(v){return String(v??'').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu,'').trim();}
export function nameValid(v){const n=normalizeName(v);return n.length>0&&[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(n)].length<=12;}
export function snapshot(s){return Object.fromEntries(['day','followers','energy','hype','loyal','favorites','mood','balloons'].map(k=>[k,s[k]]));}
export function fresh(){return {...core.fresh(),version:2,playerId:uid(),playerName:'',runId:uid(),parentRunId:null,mood:60,qch:0,zeroEnergyActiveMs:0,warningsShown:0,dailySnapshots:[],dayOpening:null,dayMoodChange:0,dayBalloons:0,eventLog:[],endingId:null,endingSnapshot:null,resumeCheckpoint:null,augustReviewed:false};}
export function migrate(raw){if(!raw)return null;if(raw.version===2)return valid(raw)?raw:null;if(!core.valid(raw))return null;return {...fresh(),...structuredClone(raw),version:2,mood:60,dayOpening:null,dailySnapshots:[],playerName:''};}
export function valid(s){if(!s||s.version!==2)return false;
 if(!validAudience(s.audience))return false;
 if(!['intro','plan','result','end','graduated'].includes(s.phase)||!Number.isInteger(s.day)||s.day<0||s.day>46)return false;
 if(!['energy','hype','loyal','favorites','mood'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100))return false;
 if(!Number.isSafeInteger(s.followers)||s.followers<0||s.followers>100000||!Number.isSafeInteger(s.balloons)||s.balloons<0||s.balloons>1000000)return false;
 if(!Number.isFinite(s.zeroEnergyActiveMs)||s.zeroEnergyActiveMs<0||s.zeroEnergyActiveMs>1000000||!Number.isFinite(s.playSeconds)||s.playSeconds<0)return false;
 if(typeof s.runId!=='string'||typeof s.playerId!=='string'||typeof s.playerName!=='string'||s.playerName&&!nameValid(s.playerName))return false;
 if(!Array.isArray(s.dailySnapshots)||!Array.isArray(s.eventLog)||!Array.isArray(s.events)||!Array.isArray(s.log)||!Array.isArray(s.photoAlbum))return false;
 if(!Number.isFinite(s.dayMoodChange)||s.dayMoodChange< -12||s.dayMoodChange>15||!Number.isFinite(s.dayBalloons)||s.dayBalloons<0)return false;
 if(s.endingId&&!['graduate','happy','bad','kyu'].includes(s.endingId))return false;
 const test={...s,version:1};
 if(s.phase==='graduated'){if(s.day>=45||s.endingId!=='graduate'||!s.resumeCheckpoint)return false;test.phase='result';}
 if(!core.valid(test))return false;
 if(s.resumeCheckpoint){if(s.resumeCheckpoint.resumeCheckpoint||s.resumeCheckpoint.phase!=='plan'||s.resumeCheckpoint.day!==s.day)return false;if(!valid(s.resumeCheckpoint))return false;}
 return true;
}
export function ensureDay(s){if(!s.dayOpening)s.dayOpening=snapshot(s);}
export function changeMood(s,delta){const next=cap(s.dayMoodChange+delta,-12,15),actual=next-s.dayMoodChange;s.mood=cap(s.mood+actual);s.dayMoodChange=next;}
export function addBalloons(s,count,addTotal=true){ensureDay(s);const before=Math.min(3,Math.floor(s.dayBalloons/50));s.dayBalloons+=count;if(addTotal)s.balloons+=count;changeMood(s,Math.min(3,Math.floor(s.dayBalloons/50))-before);}
export function zeroTick(s,ms){if(s.phase!=='plan'||s.day>=45||s.energy>0)return;s.zeroEnergyActiveMs=Math.min(1000000,s.zeroEnergyActiveMs+Math.max(0,ms));}
export function recoverZero(s){if(s.energy>0){s.zeroEnergyActiveMs=0;s.warningsShown=0;s.graduationPending=false;}}
export function closeDay(s){if(!s.pending)return;const row={day:s.day,before:s.dayOpening,after:snapshot(s),action:s.pending.action,score:s.pending.score,contest:s.pending.contest||null,events:s.eventLog.filter(e=>e.day===s.day),photoCount:s.photoAlbum.length};s.dailySnapshots=s.dailySnapshots.filter(r=>r.day!==s.day);s.dailySnapshots.push(row);}
export function resolve(s,id,score=.5,detail=null){ensureDay(s);const checkpoint=structuredClone({...s,resumeCheckpoint:null});let n=core.resolve(s,id,score,detail);n.version=2;const q=n.pending.score,a=core.ACTIONS.find(x=>x.id===id);const oldMood=s.mood;
 if(id!=='rest'){n.energy=cap(s.energy+a.energy+(oldMood>=80?1:oldMood<25?-1:0));n.hype=cap(s.hype+(a.hype>0?Math.round(a.hype*(.5+.5*q)):a.hype)-(n.streak>2?4:0)-(q<.25?2:0));n.loyal=cap(s.loyal+(a.loyal>0?Math.round(a.loyal*(.5+.5*q)):a.loyal)+(oldMood>=80?1:0)-(q<.25?1:0));}
 changeMood(n,id==='rest'?10:q>=.8?6:q>=.5?3:q<.25?-4:0);if(['cafe','chat'].includes(id)&&q>=.5)changeMood(n,2);
 // 체력이 바닥인데 기분만 계속 오르는 현상을 막고, 무리한 방송의 감정 비용을 반영한다.
 if(id!=='rest'&&n.energy<25)changeMood(n,-3);
 // 체력 0으로 방송을 마친 날은 피로가 기분 상승을 덮도록 명확한 하락을 적용한다.
 if(id!=='rest'&&n.energy===0)changeMood(n,-6);
 if(id!=='rest'&&q<.25)changeMood(n,-2);
 n.qch=cap((s.qch||0)+(q>=.8?-1:q<.25?2:0));
 if(n.pending.photo)addBalloons(n,n.pending.photo.balloons,false);
 reserveFavorites(n);recoverZero(n);n.pending.moodDelta=n.mood-s.mood;closeDay(n);
 if(n.day<45&&n.energy===0&&n.zeroEnergyActiveMs>=90000){n.phase='graduated';n.endingId='graduate';n.endingSnapshot=snapshot(n);n.resumeCheckpoint=checkpoint;}
 return n;
}
export function nextDay(s){if(s.phase!=='result')return s;const n=structuredClone(s);closeDay(n);Object.assign(n,core.nextDay(n));n.dayOpening=null;n.dayMoodChange=0;n.dayBalloons=0;if(n.phase==='end'){n.endingSnapshot=snapshot(n);n.endingId=ending(n).id;}return n;}
export function storyChoice(s,i){ensureDay(s);const before=snapshot(s);const n=core.storyChoice(s,i);if(n!==s){changeMood(n,i===0?3:5);reserveFavorites(n);n.eventLog=[...s.eventLog,{id:`story-${s.day}`,day:s.day,text:core.STORIES[s.day].title,before,after:snapshot(n)}];}return n;}
export function retryGraduate(s){if(s.phase!=='graduated'||s.day<16||!s.resumeCheckpoint)throw Error('재개할 졸업 기록이 없습니다');const n=structuredClone(s.resumeCheckpoint);n.parentRunId=s.runId;n.runId=uid();n.energy=Math.max(40,n.energy);n.mood=Math.max(40,n.mood);n.zeroEnergyActiveMs=0;n.warningsShown=0;n.endingId=null;n.endingSnapshot=null;n.resumeCheckpoint=null;n.phase='plan';return n;}
export function ending(s){const v=s.endingSnapshot||s;const id=s.endingId||(v.followers>=3000?'happy':v.hype>=70&&v.loyal>=75?'kyu':'bad');const table={happy:['버블란, 우리의 다음 방송','A','박재박: “그래 잘했다!” 큐티섹시: “내가 털의 시련을 이겨냈어!”'],kyu:['큐한성 — 크루원 모집합니다!','B','목표에는 닿지 못했지만 관심과 팬들의 사랑은 남았어요. 오늘부터 큐한성, 신입 수장입니다!'],bad:['고마웠어, 버블란','C',v.hype<70&&v.loyal<75?'새로운 관심과 꾸준한 단골을 충분히 모으지 못했어요. 박재박: “아쉬운 거지.”':v.hype<70?'팬의 사랑은 남았지만 알려질 기회가 부족했어요. 박재박: “아쉬운 거지.”':'관심은 모았지만 단골로 이어지지 못했어요. 박재박: “아쉬운 거지.”'],graduate:['오늘, 마지막 인사를 전해요','G','회복 없이 체력 0 상태로 방송을 이어갔어요. 컨디션을 유지하기 어려워, 큐티섹시는 방송을 마무리하기로 했습니다.']};const [title,rank,text]=table[id];return {id,title,rank,text};}
export function rankRows(rows){const sorted=[...rows].sort((a,b)=>b.followers-a.followers||b.loyal-a.loyal||b.hype-a.hype||b.mood-a.mood);return sorted.map((r,i)=>({...r,rank:i&&['followers','loyal','hype','mood'].every(k=>r[k]===sorted[i-1][k])?0:i+1})).map((r,i,a)=>{if(!r.rank)r.rank=a[i-1].rank;return r;});}
