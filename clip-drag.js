// One normalized interval drives the reference, guide and scoring.
export function nextPattern(previous, random=Math.random){
  let width=18+Math.floor(random()*25),left=5+Math.floor(random()*(90-width));
  if(previous&&Math.abs(left-previous.left)<5)left=previous.left<35?55:8;
  if(previous&&width===previous.width)width=width===42?41:width+1;
  left=Math.min(left,95-width);
  return {left,width,right:left+width};
}
export function matches(pattern,start,end){return end>start&&Math.abs(start-pattern.left)<=3&&Math.abs(end-pattern.right)<=3&&Math.abs((end-start)-pattern.width)<=3;}
export function mountClip(root,onAttempt,random=Math.random){
  root.innerHTML='<div class="gamebox clip-editor"><p>위 분홍 칸의 시작점부터 끝점까지 아래 칸에 그대로 드래그하세요. 위치·길이 오차는 3% 이내입니다.</p><small>목표 구간</small><div class="clip-lane clip-reference"><span class="clip-goal"></span></div><small>드래그 영역 · 왼쪽에서 오른쪽으로</small><div class="clip-lane clip-input" aria-label="목표 구간과 같은 위치와 길이로 드래그"><span class="clip-guide"></span><span class="clip-selection"></span></div><p class="clip-message" aria-live="polite">분홍 구간의 왼쪽 경계에서 시작하세요.</p></div>';
  const lane=root.querySelector('.clip-input'),goal=root.querySelector('.clip-goal'),guide=root.querySelector('.clip-guide'),fill=root.querySelector('.clip-selection'),message=root.querySelector('.clip-message');
  let pattern,drag=null,cool=0,disposed=false;
  function next(){pattern=nextPattern(pattern,random);for(const el of [goal,guide]){el.style.left=pattern.left+'%';el.style.width=pattern.width+'%';}fill.hidden=true;fill.style.width='0%';lane.dataset.left=pattern.left;lane.dataset.right=pattern.right;}
  const x=e=>(e.clientX-lane.getBoundingClientRect().left)/lane.getBoundingClientRect().width*100;
  const inside=e=>{const r=lane.getBoundingClientRect();return e.clientY>=r.top-12&&e.clientY<=r.bottom+12;};
  lane.onpointerdown=e=>{if(disposed||cool||drag||e.button!==0||!e.isPrimary)return;e.preventDefault();drag={id:e.pointerId,start:x(e)};lane.setPointerCapture(e.pointerId);fill.hidden=false;fill.style.left=drag.start+'%';fill.style.width='0%';};
  lane.onpointermove=e=>{if(drag?.id!==e.pointerId)return;const end=x(e);fill.style.left=Math.min(drag.start,end)+'%';fill.style.width=Math.abs(end-drag.start)+'%';};
  lane.onpointerup=e=>{if(drag?.id!==e.pointerId||disposed)return;const ok=inside(e)&&matches(pattern,drag.start,x(e));drag=null;if(lane.hasPointerCapture(e.pointerId))lane.releasePointerCapture(e.pointerId);onAttempt(ok);message.textContent=ok?'일치! 다음 패턴을 준비합니다.':'불일치: 시작점·끝점·길이를 모두 맞춰 주세요.';cool=.65;};
  lane.onpointercancel=lane.onlostpointercapture=()=>{drag=null;};
  next();return {tick(dt){if(cool>0){cool=Math.max(0,cool-dt);if(!cool){next();message.textContent='새 패턴 · 위 분홍 칸과 같은 위치와 길이를 그리세요.';}}},dispose(){disposed=true;drag=null;lane.onpointerdown=lane.onpointermove=lane.onpointerup=lane.onpointercancel=lane.onlostpointercapture=null;}};
}
