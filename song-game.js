export function createSong(random=Math.random){return {time:0,left:.4,width:.2,from:.4,to:0,phase:0,duration:2.2,wait:0,step:0,cool:0,note:.5,random};}
export function advanceSong(s,dt){
 s.time+=dt;s.cool=Math.max(0,s.cool-dt);s.note=(Math.sin(s.time*2.9)+1)/2;
 if(s.wait>0){s.wait=Math.max(0,s.wait-dt);return;}
 s.phase=Math.min(1,s.phase+dt/s.duration);const u=s.phase*s.phase*(3-2*s.phase);s.left=s.from+(s.to-s.from)*u;
 if(s.phase===1){s.wait=.3+s.random()*.6;s.from=s.left;s.step++;s.to=s.step%4===1?.8:s.step%4===3?0:.08+s.random()*.64;s.phase=0;s.duration=1.7+s.random()*1.6;}
}
export function songHit(s){return s.note>=s.left-1e-9&&s.note<=s.left+s.width+1e-9?1:0;}
export function mountSong(root,onAttempt,canInput=()=>true){
 const s=createSong();root.innerHTML='<div class="gamebox"><p class="track-label">움직이는 분홍 칸 안에 음표가 들어오면 노래! · SPACE</p><div class="song-lane"><div class="song-target"></div><div class="song-note">♪</div></div><button class="primary block" id="capture">♫ 한 소절 부르기 · SPACE</button></div>';
 const lane=root.querySelector('.song-lane'),target=root.querySelector('.song-target'),note=root.querySelector('.song-note'),button=root.querySelector('button');let disposed=false;
 const paint=()=>{target.style.left=s.left*100+'%';target.style.width=s.width*100+'%';note.style.left=s.note*100+'%';lane.dataset.target=s.left;lane.dataset.note=s.note;};
 const capture=()=>{if(disposed||s.cool||!canInput())return;s.cool=.65;onAttempt(songHit(s));};
 const key=e=>{if(e.code==='Space'){e.preventDefault();if(!e.repeat)capture();}};
 button.onclick=capture;document.addEventListener('keydown',key);paint();
 return {tick(dt){advanceSong(s,dt);paint();},dispose(){disposed=true;button.onclick=null;document.removeEventListener('keydown',key);}};
}
