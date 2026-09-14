export const FRAME_COUNT=24;
export const MOODS=[0,1,2,3,4,5,6,7];
const LABELS=['기본','미소','기쁨','놀람','삐침','피곤','울먹임','환한 미소','수줍음','차분함','눈 감음','집중','하품','지침','시큰둥함','응원','고개 기울임','어깨 으쓱','손 인사','윙크','윙크 인사','양손 인사','격려','양손 으쓱'];
export function framePosition(frame){return String(Math.max(0,Math.min(23,Math.trunc(Number(frame)||0))));}
let prefs={outfit:'classic',motion:'subtle'};
try{const p=JSON.parse(localStorage.getItem('fur-character')||'null');if(p){if(['classic','floral'].includes(p.outfit))prefs.outfit=p.outfit;if(['off','subtle','lively'].includes(p.motion))prefs.motion=p.motion;}}catch{}
const ready=new Set(),failed=new Set();let host=null,raf=0,last=0,clock=0,nextIdle=2500,nextBlink=3000,queue=[],remaining=0,current=0,base=0,lastKind='',getPaused=()=>false;
const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
export const frameSource=(frame,outfit=prefs.outfit)=>`assets/character-poses/${outfit}-${String(Math.max(0,Math.min(23,Math.trunc(Number(frame)||0)))).padStart(2,'0')}.webp`;
export function idleSequence(base,kind){
 if(kind==='blink')return [[9,90],[10,135],[9,90],[base,400]];
 if([3,4,5,6].includes(base))return [[base,550],[14,750],[base,550]];
 if(kind==='tilt')return [[16,1150],[base,550],[17,1100],[base,550]];
 if(kind==='wave')return [[18,450],[20,600],[21,850],[20,450],[18,450],[base,600]];
 return [[22,650],[15,900],[2,550],[base,500]];
}
export function costume(){return prefs.outfit;}
function outfitButtons(){return `<div class="outfit-switch" role="group" aria-label="캐릭터 의상 선택"><span>의상</span><button data-character-outfit="classic" aria-pressed="${prefs.outfit==='classic'}">교복</button><button data-character-outfit="floral" aria-pressed="${prefs.outfit==='floral'}">꽃무늬</button><button class="motion-cycle" data-character-motion aria-label="캐릭터 움직임 변경">움직임 · ${prefs.motion==='off'?'끔':prefs.motion==='subtle'?'은은':'생동감'}</button></div>`;}
export function motionPortrait(mood){const frame=MOODS[mood]??0;return `<div class="motion-host" data-mood="${mood}" data-motion="${prefs.motion}"><img class="motion-fallback" src="assets/character.png" alt="큐티섹시"><img class="motion-actor" src="${frameSource(frame)}" alt="큐티섹시 · ${LABELS[frame]} 표정" draggable="false"></div>${outfitButtons()}`;}
export function motionControls(){return '';}
function syncControls(){document.querySelectorAll('[data-character-outfit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.characterOutfit===prefs.outfit)));document.querySelectorAll('[data-character-motion]').forEach(b=>b.textContent='움직임 · '+(prefs.motion==='off'?'끔':prefs.motion==='subtle'?'은은':'생동감'));}
function paint(frame){current=Math.max(0,Math.min(23,frame));if(!host)return;const actor=host.querySelector('.motion-actor');actor.src=frameSource(current);actor.alt=`큐티섹시 · ${LABELS[current]} 표정`;}
export function mountPortrait(){host=document.querySelector('.motion-host');if(!host)return;base=MOODS[Number(host.dataset.mood)]??0;queue=[];remaining=0;nextIdle=clock+5000+Math.random()*5000;nextBlink=clock+2500+Math.random()*3000;host.dataset.motion=prefs.motion;host.dataset.ready=String(ready.has(prefs.outfit)&&!failed.has(prefs.outfit));paint(base);syncControls();}
export function reactPortrait(kind){if(prefs.motion==='off'||reduced.matches)return;queue=kind==='block'?[[4,700],[14,950],[base,500]]:kind==='laugh'?[[3,450],[22,800],[1,700],[base,400]]:idleSequence(base,kind==='warm'||kind==='promise'?'wave':'cheer');remaining=0;nextIdle=clock+12000;}
function step(now){raf=0;const dt=Math.min(60,Math.max(0,now-last));last=now;
 if(host&&host.isConnected&&ready.has(prefs.outfit)&&!failed.has(prefs.outfit)&&!getPaused()&&prefs.motion!=='off'&&!reduced.matches){const rect=host.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){clock+=dt;remaining-=dt;if(remaining<=0&&queue.length){const f=queue.shift();paint(f[0]);remaining=f[1];}else if(remaining<=0&&clock>=nextBlink){queue=idleSequence(base,'blink');nextBlink=clock+3800+Math.random()*4200;}else if(remaining<=0&&clock>=nextIdle){const kinds=prefs.motion==='lively'?['tilt','wave','cheer']:['tilt'];const choices=kinds.filter(k=>k!==lastKind);lastKind=(choices.length?choices:kinds)[Math.floor(Math.random()*(choices.length||kinds.length))];queue=idleSequence(base,lastKind);nextIdle=clock+(prefs.motion==='lively'?9500:17000)+Math.random()*8000;}const actor=host.querySelector('.motion-actor'),scale=1+Math.sin(clock/5200*Math.PI*2)*.0025,x=Math.sin(clock/8000*Math.PI*2)*(prefs.motion==='lively'?1.6:.8);actor.style.transform=`translate(${x.toFixed(2)}px,${(-Math.sin(clock/5200*Math.PI*2)*1.2).toFixed(2)}px) scale(${scale.toFixed(5)})`;}}
 else if(host)host.querySelector('.motion-actor').style.transform='none';if(!document.hidden)raf=requestAnimationFrame(step);
}
function savePrefs(){try{localStorage.setItem('fur-character',JSON.stringify(prefs));}catch{}document.documentElement.dataset.costume=prefs.outfit;mountPortrait();syncControls();}
export function initCharacter(paused){getPaused=paused;
 for(const outfit of ['classic','floral']){let count=0,bad=false;for(let i=0;i<FRAME_COUNT;i++){const img=new Image();img.onload=()=>{if(++count===FRAME_COUNT&&!bad){ready.add(outfit);if(prefs.outfit===outfit)mountPortrait();}};img.onerror=()=>{bad=true;failed.add(outfit);if(prefs.outfit===outfit)mountPortrait();};img.src=frameSource(i,outfit);}}
 document.addEventListener('click',e=>{const outfit=e.target.closest('[data-character-outfit]')?.dataset.characterOutfit;if(outfit&&['classic','floral'].includes(outfit)){prefs.outfit=outfit;savePrefs();return;}if(e.target.closest('[data-character-motion]')){prefs.motion={off:'subtle',subtle:'lively',lively:'off'}[prefs.motion];savePrefs();}});
 document.addEventListener('change',e=>{const key=e.target.dataset.character;if(!['outfit','motion'].includes(key))return;const values=key==='outfit'?['classic','floral']:['off','subtle','lively'];if(values.includes(e.target.value)){prefs[key]=e.target.value;savePrefs();}});
 document.documentElement.dataset.costume=prefs.outfit;document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);raf=0;last=performance.now();if(!document.hidden)raf=requestAnimationFrame(step);});reduced.addEventListener?.('change',()=>{queue=[];paint(base);});mountPortrait();last=performance.now();raf=requestAnimationFrame(step);
}
