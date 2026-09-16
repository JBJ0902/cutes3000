import {photoRewards,PHOTOS,monthForDay} from './gallery-data.js';
export const VERSION=1;
export const ACTIONS=[
 {id:'photo',name:'월간 방셀 촬영 · 판매',tag:'PHOTO SHOP',desc:'8월·9월 방셀을 촬영하고 주문에 맞게 전달해 별풍선과 즐겨찾기를 모아요.',icon:'▣',energy:-12,hype:4,loyal:3,base:8},
 {id:'up',name:'스트리머 콘텐츠 참여',tag:'UP AUDITION',desc:'UP 연타로 외부 지원자와 경쟁! 3위 안에 들면 콘텐츠 참여.',icon:'↑',energy:-14,hype:6,loyal:3,base:10},
 {id:'cafe',name:'팬카페 구경하기',tag:'CAFE',desc:'팬아트·후기·신청곡을 읽고 마음을 담아 답해요.',icon:'☕',energy:-6,hype:2,loyal:8,base:8},
 {id:'sing',name:'노래 불러주기',tag:'LIVE SONG',desc:'좋은 타이밍에 한 소절! 팬들을 위한 라이브 무대.',icon:'♪',energy:-12,hype:7,loyal:4,base:11},
 {id:'rhythm',name:'응원 타이밍 방송',tag:'CHEER',desc:'초록빛 타이밍에 GO! 응원으로 팬들과 호흡해요.',icon:'♫',energy:-11,hype:6,loyal:3,base:10},
 {id:'memory',name:'팬심 기억력 게임',tag:'MEMORY',desc:'빛나는 순서를 기억하고 팬심을 이어가요.',icon:'◇',energy:-9,hype:3,loyal:5,base:9},
 {id:'game',name:'게임 방송',tag:'PLAY',desc:'점프 챌린지로 오늘의 명장면을 만들어요.',icon:'↗',energy:-13,hype:3,loyal:2,base:10},
 {id:'clip',name:'쇼츠 제작',tag:'CREATE',desc:'딱 좋은 순간을 포착하면, 알고리즘도 반응할 거예요.',icon:'▸',energy:-10,hype:8,loyal:0,base:11},
 {id:'collab',name:'크루 합방',tag:'TOGETHER',desc:'버블란 멤버들과 티키타카. 체력 25·충성도 35 필요.',icon:'✧',energy:-17,hype:8,loyal:4,base:15},
 {id:'chat',name:'팬 소통',tag:'CONNECT',desc:'한 사람의 이야기를 기억하는 것도 성장의 시작.',icon:'♡',energy:-5,hype:-2,loyal:11,base:7},
 {id:'rest',name:'휴식 · 기획',tag:'RESET',desc:'체력 +38. 다음 활동에 준비 보너스 +6.',icon:'☾',energy:38,hype:-4,loyal:1,base:0}
];
export const FANS=['2U(Θ오Θ)U6','큐멍이♪','U(*ㅅ*)U짬뽕','슈미터☆','U´ㅅ`U리스','U`ㅅ`U대용','U≡ㅅ≡U뭉탁','U=ㅅ=U코파','U^0^U다람','U°ㅅ°U할라','U≡ㅅ≡U뭉탁','에드워드×','어둠','김구맹','노래ㄱ?','빌런'];
export const VIEWERS=[
 {name:'2U(Θ오Θ)U6',type:'열혈팬'}, {name:'큐멍이♪',type:'열혈팬'}, {name:'U(*ㅅ*)U짬뽕',type:'열혈팬'}, {name:'U^0^U다람',type:'열혈팬'}, {name:'U^0^U리버',type:'열혈팬'},
 {name:'슈미터☆',type:'열혈팬'}, {name:'U´ㅅ`U리스',type:'열혈팬'}, {name:'U`ㅅ`U대용',type:'열혈팬'}, {name:'U°ㅅ°U할라',type:'열혈팬'}, {name:'U^0^U세규',type:'열혈팬'},
 {name:'U≡ㅅ≡U뭉탁',type:'열혈팬'}, {name:'U=ㅅ=U코파',type:'열혈팬'}, {name:'에드워드×',type:'팬클럽'}, {name:'미에견',type:'팬클럽'}, {name:'큐로콩',type:'팬클럽'}, {name:'큐섹이의개',type:'팬클럽'},
 {name:'어둠',type:'팬클럽'}, {name:'김구맹',type:'팬클럽'}, {name:'노래ㄱ?',type:'팬클럽'}, {name:'빌런',type:'팬클럽'},{name:'정.복.자',type:'팬클럽'}, {name:'보스파이트',type:'팬클럽'}, {name:'김구맹',type:'팬클럽'},
 {name:'두통날때만오는사람',type:'신규 구독자'}, {name:'짱난하나냄새따라옴',type:'신규 구독자'}, {name:'나한테명령하지마',type:'신규 구독자'}, {name:'몸좋은사람',type:'신규 구독자'}, {name:'해리는호일룬',type:'신규 구독자'}, {name:'아놀드 슈왈츠제네거',type:'신규 구독자'}, {name:'근육남',type:'신규 구독자'}, {name:'이근대위',type:'신규 구독자'}, {name:'레전드오독련',type:'신규 구독자'}, {name:'컬러타일중독자',type:'신규 구독자'}, {name:'여자어쓰는사람만봄',type:'신규 구독자'}
];
export const CREW_MEMBERS=['박재박','초금비','공태연','쩜냥이','슈니','다시바','유태','츄라희','큐티섹시','예요예요','설채이','김나오','멍보리'];
export const COLLAB_MODES=['합방 게임','크루 점호','크루 디스코드 소통','버블란의 도전'];
export const STORIES={
 7:{title:'처음 생긴 단골',speaker:'컬러타일중독자',lines:['“오늘도 왔어요. 어제 컬러타일… 발라버렸던거 아직도 생각나요.”','시청자 목록에서 익숙한 이름 하나가 빛납니다. 조용하던 채팅창에 큐며든 시청자의 인사가 크게보여요.','큐티섹시: “컬러타일 안할때도 와주는 거… 당연한 거 아닌 거 알아요. 고마워요.”'],choices:[['닉네임을 부르며 인사하기',12,0,14],['함께할 다음 콘텐츠 고르기',18,6,7]]},
 15:{title:'수장님의 합방 초대',speaker:'박재박 수장님',lines:['“야 큐섹아, 감니버스 합방인데 버튜버 자리 하나 비었다. 준비됐나?”','많은 사람에게 얼굴을 알릴 기회. 하지만 대본보다 중요한 건 멤버들의 말을 듣는 것 같아요.','큐티섹시: “긴장 안 했는데요? …마이크 켜져 있었어요?”'],choices:[['멤버들과 미리 호흡 맞추기',26,8,8],['팬들과 응원 구호 준비하기',19,3,15]]},
 30:{title:'누가 이걸 클립으로?!',speaker:'씨댕댕이',lines:['“수장님 방송 켜놓고 밥먹으면서 레전드 오독한거, 조회수가 마구 올라가요!”','완벽하게 준비한 방송보다 작은 큐창이 사람들을 웃게 했어요. 낯선 닉네임들이 방송을 찾아옵니다.','큐티섹시: “이왕 이렇게 된 거… 웃고 가요. 다음 방송도 와요.”'],choices:[['새 시청자를 위한 소개 방송',30,10,8],['팬들과 후속 클립 만들기',38,16,2]]},
 39:{title:'마지막 일주일',speaker:'박재박 수장님',lines:['“9월 30일까지다. 아직 끝난 거 아니다.”','달력에 남은 칸은 일곱 개. 처음 왔던 팬부터 어제 온 팬까지, 채팅창에서 서로 인사를 나눕니다.','큐티섹시: “혼자 하는 도전인 줄 알았는데… 아니었네요. 마지막까지 같이 가요.”'],choices:[['팬들과 마지막 방송 준비',22,3,16],['버블란 합동 홍보 도전',35,14,3]]}
};
export const DAILY=[
 ['새로운 시작','첫 방송 제목을 고르는 데만 한 시간. 그래도 오늘은 시작하는 날.'],['마이크 체크','“하나, 둘… 들려요?” 채팅창에 숫자 1이 올라왔어요.'],['첫 응원','2U(Θ오Θ)U6: “오늘 방송도 화이팅!”'],['썸네일 고민','표정 세 개 중에 결국 첫 번째를 골랐어요.'],['익숙한 닉네임','어제 온 시청자가 오늘도 인사를 건넵니다.'],['작은 실수','시작 버튼 대신 종료 버튼을 누를 뻔했어요.'],['소재 노트','오늘의 아이디어를 적었어요. 별표는 다섯 개.'],['새벽의 응원','조용한응원: “말은 없어도 늘 보고 있어요.”'],['합방 준비','다른 멤버의 방송도 조금 살펴볼까요?'],['짧고 강하게','짧은 클립 하나가 긴 인연이 될 수도 있어요.'],['물 한 잔','방송 전에 목부터 챙깁니다.'],['팬아트 도착','삐뚤빼뚤한 그림인데, 묘하게 정말 닮았어요.'],['평소처럼','폭발적인 하루가 아니어도 괜찮아요.'],['새로운 포맷','늘 하던 순서를 조금 바꿔볼까요?'],['크루 대기실','버블란 멤버들의 웃음소리가 들립니다.'],['성장통','숫자가 잠깐 멈췄어요. 우리가 쌓은 시간은 남아 있어요.'],['추억의 클립','첫날 영상이 벌써 어색하게 느껴집니다.'],['다시 찾아온 팬','왕십리별: “바빴는데 이제 왔어요!”'],['작은 약속','내일도 같은 시간에 보자는 말을 남겼어요.'],['끝까지 함께','민트초코: “3,000명 되면 저희도 기억해 주세요.”']
];
export const clamp=(v,a=0,b=100)=>Math.min(b,Math.max(a,v));
export const dateLabel=d=>{const x=new Date(Date.UTC(2026,7,16+Math.min(d,45)));return `${x.getUTCMonth()+1}월 ${x.getUTCDate()}일`;};
export const fresh=()=>({version:VERSION,day:0,followers:2300,energy:85,hype:22,loyal:30,favorites:70,last:null,streak:0,prepared:false,events:[],log:[],phase:'intro',pending:null,playSeconds:0,milestone:false,liveEventDay:-1,balloons:0,photoAlbum:[]});
export function valid(s){
 if(s?.balloons!==undefined&&(!Number.isSafeInteger(s.balloons)||s.balloons<0||s.balloons>1000000))return false;
 if(s?.photoAlbum!==undefined&&(!Array.isArray(s.photoAlbum)||new Set(s.photoAlbum).size!==s.photoAlbum.length||!s.photoAlbum.every(id=>PHOTOS.some(p=>p.id===id))))return false;
 if(!s||s.version!==VERSION||!Number.isInteger(s.day)||s.day<0||s.day>46||!['followers','energy','hype','loyal','playSeconds','streak'].every(k=>Number.isFinite(s[k]))||s.followers<0||s.followers>100000||s.playSeconds<0||s.streak<0||s.streak>46||![s.energy,s.hype,s.loyal].every(v=>v>=0&&v<=100))return false;
 if(!['intro','plan','result','end'].includes(s.phase)||s.phase==='end'&&s.day!==46||s.phase!=='end'&&s.day===46||s.phase==='intro'&&s.day!==0)return false;
 if(s.last!==null&&!ACTIONS.some(a=>a.id===s.last)||typeof s.prepared!=='boolean'||typeof s.milestone!=='boolean')return false;
 const row=r=>r&&Number.isInteger(r.day)&&r.day>=0&&r.day<46&&ACTIONS.some(a=>a.name===r.action)&&['base','skill','trend','fans','prepared','buzz','final','loss','repeat','total','followers','score'].every(k=>Number.isFinite(r[k]));
 if(!Array.isArray(s.log)||s.log.length!==s.day+(s.phase==='result'?1:0)||!s.log.every((r,i)=>row(r)&&r.day===i))return false;
 if(!Array.isArray(s.events)||new Set(s.events).size!==s.events.length||!s.events.every(n=>[7,15,30,39].includes(n)&&n<=s.day))return false;
 if(s.phase==='result'&&(!row(s.pending)||s.pending.day!==s.day)||s.phase!=='result'&&s.pending!==null)return false;
 return true;
}
export function allowed(s,id){return id!=='collab'||(s.day>=8&&s.energy>=25&&s.loyal>=35);}
// 날짜 기준은 day 0 = 8월 16일이므로 8월 24일은 day 8이다.
// 잠긴 활동은 TREND로 올리지 않고, 해금 후 day 8에 크루 합방을 우선 노출한다.
export function trendActivity(s){const candidates=s.day>=8?['collab','clip','game','chat']:['clip','game','chat'];const available=candidates.filter(id=>allowed(s,id));return available[(s.day-(s.day>=8?8:0))%available.length];}
export function resolve(s,id,score=0.5,detail=null){if(s.day>=46||s.phase!=='plan'||!allowed(s,id))throw Error('Invalid action');const a=ACTIONS.find(a=>a.id===id);if(!a)throw Error('Unknown action');if(id==='photo'){const reward=photoRewards(detail?.capture,detail?.orders,s.energy,s.last===id?s.streak+1:1);score=reward.score;}score=clamp(score,0,1);let n=structuredClone(s);let streak=n.last===id?n.streak+1:1;
 const fatigue=id==='rest'?1:s.energy<15?.5:s.energy<30?.75:1;
 const repeat=id!=='rest'&&streak>=3?Math.min(12,(streak-2)*4):0;
 const base=Math.round(a.base*fatigue);
 const skill=id==='rest'?0:Math.round(score*10*fatigue);
 // 낮은 성과가 기본 유입으로 상쇄되지 않도록 품질 패널티를 둔다.
 const qualityPenalty=id==='rest'?0:score<.25?-14:score<.45?-6:0;
 const trend=id===trendActivity(s)?5:0;
 const fans=id==='rest'?0:Math.floor(s.loyal/35);
 const prepared=s.prepared&&id!=='rest'?6:0;
 const buzz=['clip','collab'].includes(id)?Math.floor(s.hype/25):0;
 const loss=id==='rest'?Math.max(1,5-Math.floor(s.loyal/35)):Math.max(1,4-Math.floor(s.loyal/30));
 const final=s.day===45?Math.floor(s.loyal*.30):0;
 const total=base+skill+trend+fans+prepared+buzz+final-loss-repeat+qualityPenalty;
 n.followers=Math.max(0,n.followers+total);n.energy=clamp(n.energy+a.energy);const stress=n.energy<25?2:0;const exhaustion=n.energy<15?2:0;const poorResult=score<.45?3:0;const poorLoyal=score<.45?2:0;const repeatHype=streak>2?4:0;const repeatLoyal=streak>2?2:0;n.hype=clamp(n.hype+a.hype-(streak>2?4:0)-stress-poorResult);n.loyal=clamp(n.loyal+a.loyal-exhaustion-poorLoyal-repeatLoyal);n.prepared=id==='rest';n.last=id;n.streak=streak;
 const r={day:s.day,action:a.name,base,skill,trend,fans,prepared,buzz,final,loss,repeat,qualityPenalty,total,followers:n.followers,score};if(id==='photo'){const reward=photoRewards(detail?.capture,detail?.orders,s.energy,streak);const before=Number.isFinite(s.favorites)?clamp(s.favorites):70;n.favorites=clamp(before+Math.floor(reward.favorites));n.balloons=(Number.isFinite(s.balloons)?s.balloons:0)+reward.balloons;const selected=PHOTOS.find(p=>p.id===detail?.photoId&&p.month===monthForDay(s.day));n.photoAlbum=[...new Set([...(Array.isArray(s.photoAlbum)?s.photoAlbum:[]),...(selected&&reward.orders>0?[selected.id]:[])])];r.photo={...reward,favorites:n.favorites-before,photoId:selected?.id||null};}n.pending=r;n.log.push(r);n.phase='result';n.milestone=n.milestone||n.followers>=3000;return n;
}
export function nextDay(s){if(s.phase!=='result')return s;return {...s,day:s.day+1,pending:null,phase:s.day===45?'end':'plan'};}
export function storyChoice(s,index){const e=STORIES[s.day];if(!e||s.events.includes(s.day))return s;const c=e.choices[index];if(!c)return s;return {...s,followers:s.followers+c[1],hype:clamp(s.hype+c[2]),loyal:clamp(s.loyal+c[3]),events:[...s.events,s.day]};}
export function ending(s){if(s.followers>=3300&&s.loyal>=70)return {title:'이제 시작이야',rank:'S',text:'박재박 수장님: “버블란에 제대로 자리 잡았네. 다음 목표도 기대하겠다.”'};if(s.followers>=3000)return {title:'살아남았다!',rank:'A',text:'박재박 수장님: “약속 지켰네. 큐티섹시, 버블란 잔류다!”'};if(s.followers>=2900)return {title:'조금만 더였는데',rank:'B',text:'밤샘토끼: “숫자는 조금 모자라도, 우리가 함께한 시간은 진짜였어요.”'};return {title:'털의 재도전',rank:'C',text:'큐티섹시: “이번에 배운 거 많아요. 다음에는 조금 더 잘할 수 있을 것 같아요.”'};}
