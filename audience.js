// Fictional local audience simulation. No real users, payments or SOOP API.
import {CHEERS,SUPPORT,TROLLS} from './content.js';
export const GROUPS = {new:'신규시청자',fan:'팬클럽',elite:'열혈팬'};
export const TOPICS = {idle:'잡담',sing:'노래',rhythm:'응원 타이밍',memory:'기억력 게임',game:'점프 게임',clip:'쇼츠 제작',photo:'방셀 촬영',cafe:'팬카페',chat:'팬 소통',up:'스트리머 콘텐츠',collab:'크루 합방',rest:'휴식'};
const cap=(n,lo=0,hi=100)=>Math.min(hi,Math.max(lo,Number(n)||0));
const pick=(a,r)=>a[Math.min(a.length-1,Math.floor(r()*a.length))];
const weighted=(a,w,r)=>{let n=r()*a.reduce((s,v)=>s+w(v),0);return a.find(v=>(n-=w(v))<=0)||a.at(-1);};
export const online=a=>a.people.filter(v=>v.online&&!v.blocked);
export const ranking=a=>a.people.filter(v=>v.donated>0).sort((x,y)=>y.donated-x.donated||x.id.localeCompare(y.id)).slice(0,20);
export const chatInterval=count=>Math.max(1.5,8-Math.sqrt(Math.max(0,count))*.62);
export const favoriteCeiling=s=>100-(s.audience?.people||[]).reduce((n,v)=>n+(v.blocked?v.refundable:0),0);
export function reserveFavorites(s){s.favorites=cap(s.favorites,0,Math.max(0,favoriteCeiling(s)));return s;}
export function validAudience(a){
  if(a===undefined)return true;
  if(!a||a.version!==1||!Array.isArray(a.people)||a.people.length<180||a.people.length>600||!Array.isArray(a.messages)||a.messages.length>80||!Array.isArray(a.gifts)||a.gifts.length>200)return false;
  const ids=new Set(),names=new Set();
  for(const v of a.people){if(!v||typeof v.id!=='string'||ids.has(v.id)||typeof v.name!=='string'||v.name.length>100||names.has(v.name)||!GROUPS[v.tier]||!Array.isArray(v.interests)||v.interests.length>12)return false;ids.add(v.id);names.add(v.name);
    if(!['online','blocked','trouble','returning'].every(k=>typeof v[k]==='boolean')||!['donated','historical','watch','entered','kickedUntil','abuseUntil','lastAbuse','moderatedDay','refundable'].every(k=>Number.isFinite(v[k]))||v.donated<0||v.donated>1000000||v.refundable<0||v.refundable>1)return false;}
  if(!['time','seq','chatClock','rosterClock','supportClock','pressure','penaltyClock','feedbackAt','nextGiftAt'].every(k=>Number.isFinite(a[k])&&a[k]>=0))return false;
  if(!a.day||!['index','gifts','balloons','penalties','goodMods','badMods','stress'].every(k=>Number.isFinite(a.day[k])))return false;
  if(a.kicks!==undefined&&!Array.isArray(a.kicks))return false;
  return a.messages.every(m=>m&&typeof m.id==='string'&&typeof m.text==='string'&&m.text.length<=500&&typeof m.name==='string'&&m.name.length<=100&&Number.isFinite(m.at)&&(!m.viewerId||ids.has(m.viewerId)))&&a.gifts.every(g=>g&&typeof g.id==='string'&&ids.has(g.viewerId)&&Number.isFinite(g.amount)&&g.amount>0&&g.amount<=120&&Number.isFinite(g.at)&&typeof g.thanked==='boolean');
}
export function ensureAudience(s,seeds=[],r=Math.random){
  if(s.audience?.version===1){const a=s.audience;a.kicks??=[];if(a.giftSnapshotVersion!==1){for(const gift of a.gifts){const v=a.people.find(p=>p.id===gift.viewerId),tier=GROUPS[gift.tierAtGift]?gift.tierAtGift:gift.wasNew?'new':GROUPS[v?.tier]?v.tier:'fan';gift.tierAtGift=tier;gift.groupAtGift=GROUPS[tier];gift.requiredGreeting??=tier==='new'&&gift.amount<=100?'ㅍㄴㅍㄴ':'ㅇㅇㄱ';const message=a.messages.find(m=>m.giftId===gift.id&&m.kind==='donation');if(message)message.tier=tier;}a.giftSnapshotVersion=1;}return a;}
  const people=[],names=new Set();
  const add=(name,tier)=>{name=String(name).normalize('NFC').slice(0,70);if(names.has(name))return;names.add(name);const i=people.length;const historical=tier==='elite'?Math.max(20,70-i*2):tier==='fan'?5+i%12:0;people.push({id:'v'+i,name,tier,donated:historical,historical,online:false,blocked:false,returning:false,trouble:tier==='new'&&r()<.18,interests:[Object.keys(TOPICS)[1+i%10],Object.keys(TOPICS)[1+(i*3)%10]],watch:0,entered:0,kickedUntil:0,abuseUntil:0,lastAbuse:-1000,moderatedDay:-1,refundable:0});};
  seeds.forEach(v=>add(v.name,/열혈/.test(v.type)?'elite':/팬클럽/.test(v.type)?'fan':'new'));
  const adjectives=['새벽','분홍','달빛','포근한','별빛','느긋한','노래하는','구름','반짝','웃는','우주','소소한','따뜻한','바람','푸른','오늘의'];
  const nouns=['토끼','고양이','라떼','푸딩','털뭉치','산책','리본','다람쥐','별사탕','구독자','노트','복숭아','쿠키','소나기','여우','멜로디','마카롱','참새','수달','밤하늘'];
  for(const x of adjectives)for(const y of nouns){const elite=people.filter(v=>v.tier==='elite').length<20;add(x+y,elite?'elite':people.length<70?'fan':'new');}
  const a=s.audience={version:1,giftSnapshotVersion:1,people,messages:[],gifts:[],kicks:[],time:0,seq:0,chatClock:0,rosterClock:0,supportClock:0,pressure:0,penaltyClock:0,feedbackAt:0,nextGiftAt:8,topic:'idle',lastTopic:'idle',day:{index:s.day,gifts:0,balloons:0,penalties:0,goodMods:0,badMods:0,stress:0}};
  updateRanks(a);
  const pool=[...people];while(online(a).length<targetViewers(s)&&pool.length){const v=weighted(pool,v=>v.tier==='elite'?4:v.tier==='fan'?2:1,r);v.online=true;pool.splice(pool.indexOf(v),1);}
  for(let i=0;i<3;i++)say(a,pick(online(a),r),['오늘도 함께할게요!','방송 켜져서 들어왔어요.','채팅으로 같이 응원해요!'][i]);
  return a;
}
export function targetViewers(s){const a=s.audience;return Math.round(cap(8+cap(s.hype)*.65+cap(s.loyal)*.12+Math.min(12,Math.max(0,s.followers)/1000)+(a?.pressure||0)*2+Math.min(10,(s.qch||0)*.08),5,180));}
function day(a,s){if(a.day.index!==s.day){a.day={index:s.day,gifts:0,balloons:0,penalties:0,goodMods:0,badMods:0,stress:0};a.supportClock=0;a.nextGiftAt=a.time+8;a.topic='idle';}}
export function say(a,v,text,kind='normal',extra={}){const m={id:'chat-'+(++a.seq),at:a.time,viewerId:v?.id||null,name:v?.name||'방송 안내',tier:v?.tier||'system',text:String(text).slice(0,500),kind,...extra};a.messages.push(m);a.messages=a.messages.slice(-80);return m;}
function updateRanks(a){const top=new Set(ranking(a).map(v=>v.id));for(const v of a.people){if(top.has(v.id))v.tier='elite';else if(v.tier==='elite')v.tier='fan';}}
function effect(s,delta,reason){
  const before=Object.fromEntries(['day','followers','hype','loyal','mood','energy','favorites','balloons'].map(k=>[k,s[k]]));
  if(!s.dayOpening)s.dayOpening={day:s.day,...before};
  for(const k of ['hype','loyal','energy','favorites'])if(delta[k])s[k]=cap(s[k]+delta[k]);
  reserveFavorites(s);
  if(delta.mood){const used=cap(s.dayMoodChange+delta.mood,-12,15)-s.dayMoodChange;s.mood=cap(s.mood+used);s.dayMoodChange+=used;}
  const after=Object.fromEntries(Object.keys(before).map(k=>[k,s[k]]));
  const changes=Object.fromEntries(Object.keys(before).map(k=>[k,after[k]-before[k]]).filter(([,n])=>n));
  if(Object.keys(changes).length){s.eventLog.push({id:'audience-'+s.runId+'-'+(++s.audience.seq),day:s.day,text:reason,before,after});}
  return changes;
}
export function supportFactor(s){const a=s.audience;return cap((.65+s.loyal/200)*(1-a.pressure*.12)*(1+Math.min(4,a.day.goodMods)*.04)*(1-Math.min(.22,(s.qch||0)*.002)),.3,1.35);}
export function donate(s,v,amount,r=Math.random){const a=s.audience;day(a,s);if(s.phase!=='plan'||!v?.online||v.blocked||a.day.gifts>=3)return null;
  amount=Math.floor(Math.min(amount,120-a.day.balloons,1000000-s.balloons));if(amount<=0)return null;
  const tierAtGift=v.tier,groupAtGift=GROUPS[tierAtGift],requiredGreeting=tierAtGift==='new'&&amount<=100?'ㅍㄴㅍㄴ':'ㅇㅇㄱ';
  const oldThreshold=Math.min(3,Math.floor((s.dayBalloons||0)/50));
  effect(s,{},'후원');const before=Object.fromEntries(['day','followers','hype','loyal','mood','energy','favorites','balloons'].map(k=>[k,s[k]]));s.balloons+=amount;s.dayBalloons+=amount;a.day.balloons+=amount;a.day.gifts++;v.donated+=amount;
  s.eventLog.push({id:'gift-ledger-'+(++a.seq),day:s.day,text:`${v.name}님 별풍선 ${amount}개`,before,after:{...before,balloons:s.balloons}});
  const gift={id:'gift-'+(++a.seq),viewerId:v.id,amount,at:a.time,thanked:false,missed:false,reactionOffered:false,wasNew:tierAtGift==='new',tierAtGift,groupAtGift,requiredGreeting};a.gifts.push(gift);a.gifts=a.gifts.slice(-200);
  if(v.tier==='new'&&r()<.35)v.tier='fan';updateRanks(a);
  say(a,v,`🎈 별풍선 ${amount}개! 오늘 방송도 응원해요!`,'donation',{giftId:gift.id,tier:tierAtGift});
  const reactions=amount>=50?['와 별풍선이다!','후원 감사합니다, 큐티섹시!','이건 꼭 답장해 줘요!']:['작은 응원도 소중해요!','별풍선 들어왔네요 ㅎㅎ'];
  for(const text of reactions.slice(0,amount>=50?3:2))say(a,weighted(online(a).filter(p=>p.id!==v.id),p=>p.tier==='elite'?3:p.tier==='fan'?2:1,r),text,'gift-reaction',{giftId:gift.id});
  effect(s,{mood:Math.min(3,Math.floor(s.dayBalloons/50))-oldThreshold},'후원 누적 응원');
  return gift;
}
export function attemptDonation(s,r=Math.random){const a=s.audience;day(a,s);if(a.time<a.nextGiftAt||a.day.gifts>=3||a.day.balloons>=120)return null;
  a.nextGiftAt=a.time+25;const factor=supportFactor(s);if(r()>.72*factor)return null;
  const candidates=online(a).filter(v=>v.abuseUntil<=a.time);if(!candidates.length)return null;
  const v=weighted(candidates,v=>(v.tier==='elite'?8:v.tier==='fan'?3:1)*(v.interests.includes(a.topic)?1.3:1)*(1+Math.min(v.watch,600)/1200),r);
  const generous=r()<(v.tier==='elite'?.15:v.tier==='fan'?.1:.05);
  const amounts=generous?[50,75,100]:v.tier==='elite'?[20,30,50]:v.tier==='fan'?[5,10,20]:[1,3,5];return donate(s,v,Math.max(1,Math.round(pick(amounts,r)*Math.min(1.1,factor))),r);
}
export function abuse(s,v,text){const a=s.audience;if(!v?.online||v.blocked)return null;v.lastAbuse=a.time;v.abuseUntil=a.time+75;return say(a,v,text,'troll');}
export function moderate(s,id,action,r=Math.random){const a=s.audience;day(a,s);const v=a.people.find(v=>v.id===id);if(!v||s.phase!=='plan')return {ok:false,message:'방송 진행 중에만 관리할 수 있어요.'};
  if(action==='unblock'){if(!v.blocked)return {ok:false,message:'이미 해제된 시청자예요.'};v.blocked=false;const refund=v.refundable;v.refundable=0;const changes=effect(s,{favorites:refund},'차단 해제: '+v.name);v.kickedUntil=0;v.returning=true;say(a,null,`${v.name}님 차단 해제 · 다음 입장 갱신에 재입장합니다.`,'system');return {ok:true,changes,message:'차단 해제 완료. 실제 차감했던 즐겨찾기만 복원합니다.'};}
  if(!['kick','block'].includes(action)||v.blocked||(action==='kick'&&!v.online))return {ok:false,message:'현재 처리할 수 없는 시청자예요.'};
  const toxic=v.abuseUntil>a.time,once=v.moderatedDay!==s.day;v.online=false;v.returning=action==='kick';v.kickedUntil=a.time+45+Math.floor(r()*31);v.abuseUntil=0;
  let delta={};
  if(action==='block'){v.blocked=true;v.refundable=Math.min(1,s.favorites);delta.favorites=-v.refundable;}
  if(once){v.moderatedDay=s.day;if(toxic&&a.day.goodMods<4){a.day.goodMods++;delta.loyal=1;delta.hype=-1;delta.mood=1;}else if(!toxic&&a.day.badMods<4){a.day.badMods++;delta.loyal=-1;delta.hype=-1;}}
  const changes=effect(s,delta,(action==='block'?'차단: ':'강퇴: ')+v.name);
  if(action==='kick'){a.kicks??=[];a.kicks.unshift({id:'kick-'+(++a.seq),viewerId:v.id,name:v.name,day:s.day,at:a.time,reason:toxic?'악플 대응':'일반 시청자 관리',wrong:!toxic});a.kicks=a.kicks.slice(0,100);}
  if(!toxic){s.qch=cap((s.qch||0)+(v.donated>0?3:2));say(a,null,`${v.name}님 관리가 잘못 처리된 것 같아요. 큐창 스탯 +${v.donated>0?3:2}`,'warning');}
  a.pressure=cap(online(a).filter(p=>p.abuseUntil>a.time).length,0,5);say(a,null,`${v.name}님 ${action==='block'?'차단':'강퇴'} · ${toxic?'악플 대응':'일반 시청자 관리'}`,'system');
  return {ok:true,changes,reaction:toxic?'angry':'mistake',message:toxic?'악플에 대응했어요. 같은 유저의 관리 보상은 하루 한 번입니다.':'일반 시청자 퇴장은 팬들의 신뢰와 화제성을 조금 낮춥니다.'};
}
export function reply(s,text,giftId,r=Math.random){const a=s.audience;text=String(text).normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu,'').trim().slice(0,100);if(!text||s.phase!=='plan')return {ok:false,message:'방송 진행 중에 답변을 입력해 주세요.'};a.lastReply=a.time;
  say(a,{id:null,name:'큐티섹시',tier:'host'},text,'host');
  const gift=a.gifts.find(g=>g.id===giftId),v=gift&&a.people.find(v=>v.id===gift.viewerId);
  if(!gift||!v||gift.thanked||a.time-gift.at>60||v.blocked||!v.online)return {ok:true,message:'답변을 보냈어요.'};
  const tierAtGift=GROUPS[gift.tierAtGift]?gift.tierAtGift:gift.wasNew?'new':v.tier,expected=gift.requiredGreeting||(tierAtGift==='new'&&gift.amount<=100?'ㅍㄴㅍㄴ':'ㅇㅇㄱ');
  if(!text.includes(expected)){s.qch=cap((s.qch||0)+2);say(a,null,`${v.name}님은 후원 당시 ${GROUPS[tierAtGift]||'시청자'}였으므로 ${expected}로 인사해야 했어요. 큐창 스탯 +2`,'warning');return {ok:true,reaction:'mistake',message:`후원 당시 등급에 맞는 인사가 아니에요. 정답은 ${expected}입니다.`};}
  s.qch=cap((s.qch||0)-1);
  gift.thanked=true;if(gift.wasNew&&v.tier==='new'&&r()<.8){v.tier='fan';say(a,v,'인사해 줘서 고마워요! 팬클럽으로 함께할게요.','promotion');return {ok:true,reaction:'heart',message:'신규 시청자가 팬클럽으로 승급했어요!'};}
  say(a,v,'답변 고마워요! 다음 방송도 들를게요.','normal');return {ok:true,reaction:'heart',message:'후원자에게 인사가 전달됐어요. 같은 후원에는 한 번만 반영됩니다.'};
}
const BANK={
  cheer:['오늘도 목표까지 같이 가요!','잘하고 있어요, 천천히 해요!','물 한 모금 마시고 해요.','큐티섹시 화이팅 ✦'],
  casual:['저녁 먹고 보러 왔어요.','오늘도 출석 완료!','채팅 읽어주는 거 좋아요.','잠깐 보려다가 계속 보고 있네요.','이 분위기 편안하다.','다들 뭐 하면서 보고 있어요?'],
  joke:['ㅋㅋ 이건 클립각인데요','방금 귀여운 실수 못 본 척해 드림','오늘도 씨댕댕이 출근했습니다!','웃다가 물 쏟을 뻔 ㅋㅋ'],
  sing:['이번 소절 타이밍 좋다!','음표 따라가는 거 은근 집중되네요.','다음 노래도 기대돼요!'],rhythm:['GO! GO! 같이 응원해요!','지금 타이밍이다!'],memory:['순서 기억했어요? 저는 벌써 헷갈림 ㅋㅋ','다음 빛나는 칸 잘 봐요!'],game:['하트 조심! 다음 발판 가자!','점프 간격 잘 봐요!'],clip:['분홍 구간 길이 딱 맞춰 보자!','이 장면 쇼츠로 남겨요!'],photo:['이번 방셀 표정 예쁘다!','주문은 손하트로 부탁해요!'],cafe:['팬아트 그려 준 분 정성이다.','팬카페 후기 읽으니 훈훈하네.'],chat:['제 이야기 읽어 줘서 고마워요.','오늘도 함께 이야기해요!'],up:['UP! 상위 3명 안에 들자!','다른 스트리머도 빠르네요, 집중!'],collab:['크루 멤버들 호흡 좋다!','합방 티키타카 재미있네요 ㅋㅋ'],rest:['오늘은 푹 쉬어요. 다음에 또 봐요!','쉬는 것도 방송 준비죠!'],
  troll:['이걸 누가 끝까지 보나요?','못하는데 왜 계속 해요?','채팅도 제대로 안 읽네요.','재미없는데 다른 거나 하죠.'],
  good:['방금 성공 멋졌다!','이건 진짜 잘했어요 ㅋㅋ','정확했다! 계속 가보자!'],bad:['괜찮아요, 다음 기회가 있어요.','조금 아깝다! 한 번 더 집중!','급하게 하지 말고 천천히 해요.']
};
export function contextChat(s,kind,topic,detail='',r=Math.random){const a=s.audience;if(topic&&TOPICS[topic]){a.topic=topic;a.lastTopic=topic;}if(kind==='feedback'&&a.time-a.feedbackAt<5)return;if(kind==='feedback')a.feedbackAt=a.time;
  const title=TOPICS[topic]||'방송';const text=kind==='start'?`${title} 시작! ${detail}`:kind==='result'?`${title} 결과: ${detail}`:kind==='photo-sale-balloon'?'방셀 주문과 함께 별풍선 응원이 들어왔어요!':kind==='cancel'?`${title} 잠시 쉬어 가요.`:detail;
  if(kind==='result'){say(a,null,text,'result');return;}
  if(kind==='photo-sale-balloon'){say(a,{id:null,name:'방셀 판매 응원',tier:'system'},text,'photo-sale-balloon');return;}
  const v=pick(online(a).filter(v=>!v.blocked&&v.abuseUntil<=a.time),r);if(!v)return;
  say(a,v,text||pick(BANK[a.topic]||BANK.cheer,r),'context');
}
export function tickAudience(s,seconds,ctx={},r=Math.random){const a=s.audience;day(a,s);if(s.phase!=='plan'||!ctx.running)return {changed:false,gifts:[]};
  const dt=cap(seconds,0,2);a.time+=dt;a.chatClock+=dt;a.rosterClock+=dt;a.supportClock+=dt;a.penaltyClock+=dt;
  const current=online(a);current.forEach(v=>v.watch+=dt);
  if(a.rosterClock>=3){a.rosterClock=0;const returning=a.people.find(v=>v.returning&&!v.blocked&&!v.online&&v.kickedUntil<=a.time);
    if(returning&&online(a).length<180){returning.online=true;returning.entered=a.time;returning.returning=false;say(a,returning,'다시 들어왔어요.','return');}
    else{const n=targetViewers(s),list=online(a);if(list.length<n){const pool=a.people.filter(v=>!v.online&&!v.blocked&&!v.returning&&v.kickedUntil<=a.time);if(pool.length){const v=weighted(pool,v=>v.tier==='new'?1+a.pressure*.7:v.tier==='fan'?2:3,r);v.online=true;v.entered=a.time;}}
    else{const out=list.filter(v=>a.time-v.entered>(v.tier==='new'?(v.interests.includes(a.topic)?180:45):240));if(out.length&&(list.length>n||r()<.12)){pick(out,r).online=false;}}}
  }
  const toxic=online(a).filter(v=>v.abuseUntil>a.time);a.pressure=cap(toxic.length,0,5);
  for(const gift of a.gifts.filter(g=>g.reactionOffered&&!g.thanked&&!g.missed&&a.time-g.at>60)){
    gift.missed=true;const donor=a.people.find(v=>v.id===gift.viewerId);effect(s,{loyal:-3,favorites:-2,mood:-2},'별풍선 미응답 · 후원자 이탈');s.qch=cap((s.qch||0)+2);
    say(a,donor,`별풍선 ${gift.amount}개 보냈는데 반응이 없네요...`,'missed-gift',{giftId:gift.id});
    say(a,null,'별풍선 후원에는 감사 인사를 해주는 게 좋아요.','warning',{giftId:gift.id});
    say(a,weighted(online(a),v=>v.tier==='elite'?3:v.tier==='fan'?2:1,r),'방금 후원 놓친 거 아니죠?','gift-reaction',{giftId:gift.id});
  }
  if(a.penaltyClock>=20){a.penaltyClock=0;const neglected=toxic.some(v=>a.time-v.lastAbuse>=15);
    if(neglected&&a.day.penalties<3){a.day.penalties++;effect(s,{loyal:-1,hype:1,mood:-2},'악플 방치 · 팬 이탈과 신규 관심');say(a,null,'악플 방치: 충성도 −1 · 화제성 +1 · 기분 −2 · 후원 확률 감소','warning');}
    if(s.mood<25&&a.day.stress<2){a.day.stress++;effect(s,{energy:-1},'낮은 기분으로 인한 방송 피로');say(a,null,'기분 25 미만: 체력 −1 · 하루 최대 −2','warning');}
    if((s.qch||0)>=25&&a.day.qchHits<2){a.day.qchHits=(a.day.qchHits||0)+1;effect(s,{favorites:-1},'큐창 누적 실수 · 즐겨찾기 이탈');say(a,null,'실수가 누적되어 즐겨찾기 −1 · 악플 유입 증가','warning');}}
  if(a.chatClock>=chatInterval(online(a).length)){a.chatClock=0;const pool=online(a);if(pool.length){const v=weighted(pool,v=>v.tier==='new'?1:3,r);if(v.trouble&&r()<Math.min(.8,.32+(s.qch||0)*.006)&&a.time-v.lastAbuse>=35){abuse(s,v,pick([...BANK.troll,...TROLLS],r));}else{const bank=v.interests.includes(a.topic)&&r()<.65?BANK[a.topic]:r()<.4?[...BANK.cheer,...CHEERS,...SUPPORT]:r()<.5?BANK.casual:BANK.joke;say(a,v,pick(bank||BANK.casual,r));}}}
  const gifts=[];if(a.supportClock>=20){a.supportClock=0;const gift=attemptDonation(s,r);if(gift)gifts.push(gift);}
  return {changed:true,gifts};
}
