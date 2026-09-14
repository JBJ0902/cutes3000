const clamp = v => Math.max(0, Math.min(1, v));

export function createAudio(read) {
  const saved = read('fur-music') || {};
  const sound = read('fur-settings') || {};
  const state = {
    volume: Number.isFinite(saved.volume) ? clamp(saved.volume) : .25,
    sfx: Number.isFinite(sound.volume) ? clamp(sound.volume / 100) : .5,
    mode: ['sequence', 'random', 'repeat'].includes(saved.mode) ? saved.mode : 'random',
    stopped: !!saved.stopped,
    index: Number.isInteger(saved.track) ? Math.max(0, Math.min(6, saved.track)) : 0
  };
  const music = new Audio(), ending = new Audio(), voices = [], last = new Map();
  let context = 'game', pending = !state.stopped, transition = 0, fadeTimer = 0, onchange = () => {};
  music.preload = ending.preload = 'metadata';
  ending.src = 'assets/music/ending.mp3';
  const titles = ['GO! GO! 큐티섹시', '3000개의 꿈', '끝나지 않는 이 방송', '3,000명까지 한 걸음 더', '우리들의 알림', '우리의 밤은 계속돼', '큐티섹시'];
  const persist = () => { try { localStorage.setItem('fur-music', JSON.stringify({track:state.index,volume:state.volume,mode:state.mode,stopped:state.stopped})); localStorage.setItem('fur-settings', JSON.stringify({volume:Math.round(state.sfx*100)})); } catch {} };
  const current = () => context === 'ending' ? ending : music;
  const load = () => { music.src = `assets/music/track-${state.index + 1}.mp3`; music.loop = state.mode === 'repeat'; };
  const random = () => { state.index = (state.index + 1 + Math.floor(Math.random() * 6)) % 7; load(); };
  const play = () => { state.stopped = false; pending = true; persist(); const a = current(); a.volume = state.volume; a.play().then(() => { pending = false; onchange(); }).catch(() => { pending = true; onchange(); }); };
  const stop = () => { state.stopped = true; pending = false; transition++; clearInterval(fadeTimer); music.pause(); ending.pause(); music.currentTime = ending.currentTime = 0; persist(); onchange(); };
  const reset = () => { const shouldPlay=!state.stopped&&(!current().paused||pending); state.volume=.25;state.sfx=.5;state.mode='random';state.index=0;state.stopped=!shouldPlay;pending=shouldPlay;transition++;clearInterval(fadeTimer);last.clear();music.pause();ending.pause();music.currentTime=ending.currentTime=0;load();music.volume=ending.volume=state.volume;persist();onchange();if(shouldPlay)play(); };
  function fx(name) {
    if (!state.sfx || document.hidden) return;
    const now = performance.now(), gap = {select_move:100,score:333,coin:150,byulpoong:2270,coin_came_out_of_keyboard:3000}[name] || 180;
    if (now - (last.get(name) ?? -Infinity) < gap) return;
    last.set(name, now);
    while (voices.length && voices[0].ended) voices.shift();
    if (voices.length >= 4) voices.shift().pause();
    const v = new Audio(`assets/sfx/${name}.mp3`);
    v.volume = state.sfx * ({select_move:.45,select_confirm:.65,byulpoong:.85,game_lose:.65,coin_came_out_of_keyboard:.55}[name] || .75);
    v.__keepForModal = name === 'byulpoong';
    voices.push(v); v.play().catch(() => {});
  }
  const clearFx = () => { voices.splice(0).forEach(v => { if (!v.__keepForModal) v.pause(); }); };
  function enterEnding() {
    if (context === 'ending') return;
    clearFx(); context = 'ending'; const token = ++transition, start = performance.now(), vol = music.volume;
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      if (token !== transition) { clearInterval(fadeTimer); return; }
      const t = Math.min(1, (performance.now() - start) / 1200); music.volume = vol * (1 - t);
      if (t === 1) {
        clearInterval(fadeTimer); music.pause(); music.currentTime = 0; ending.currentTime = 0; ending.volume = state.volume;
        if (!state.stopped) ending.play().catch(() => {});
        onchange();
      }
    }, 30);
    onchange();
  }
  function leaveEnding() { if (context !== 'ending') return; context='game'; transition++; clearInterval(fadeTimer); ending.pause(); ending.currentTime=0; music.volume=state.volume; if(!state.stopped) play(); onchange(); }
  if (state.mode === 'random') random(); else load(); music.volume = ending.volume = state.volume;
  music.onended = () => { if (context !== 'game' || state.stopped) return; if (state.mode === 'random') random(); else { state.index=(state.index+1)%7; load(); } play(); };
  for (const el of [music, ending]) { el.onplay=el.onpause=()=>onchange(); el.onerror=()=>onchange('음악을 불러오지 못했어요. 게임은 계속할 수 있어요.'); }
  document.addEventListener('pointerdown',()=>{if(pending&&!state.stopped)play();});
  document.addEventListener('keydown',e=>{if(pending&&!state.stopped&&!e.repeat)play();});
  function mount(player) {
    player.innerHTML = `<label class="music-track">♫ 곡 선택<select id="track-select">${titles.map((t,i)=>`<option value="${i}">${t}</option>`).join('')}</select></label><div class="music-buttons"><button id="music-play">재생</button><button id="music-stop">정지</button><button id="music-random">랜덤 재생</button></div><div class="music-modes" role="group" aria-label="재생 방식">${[['sequence','순서대로'],['random','랜덤'],['repeat','한 곡 반복']].map(([k,t])=>`<button data-music-mode="${k}" aria-pressed="false">${t}</button>`).join('')}</div><label class="music-volume">배경음악 <input id="music-volume" type="range" min="0" max="100"><output id="music-volume-text"></output></label><p id="music-status" role="status"></p>`;
    const $=q=>player.querySelector(q);
    onchange=message=>{$('#track-select').value=state.index;$('#track-select').disabled=context==='ending';$('#music-random').disabled=context==='ending';$('#music-volume').value=Math.round(state.volume*100);$('#music-volume-text').textContent=Math.round(state.volume*100)+'%';$('#music-play').textContent=current().paused?'재생':'일시정지';$('#music-status').textContent=message||(context==='ending'?'엔딩곡 · 반짝이는 결말 · ':'')+(current().paused?(pending?'음악 시작 버튼을 눌러 주세요.':'정지'):'재생 중');player.querySelectorAll('[data-music-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.musicMode===state.mode)));};
    $('#track-select').onchange=e=>{state.index=+e.target.value;const playing=!music.paused;load();persist();if(playing)play();onchange();};
    $('#music-play').onclick=()=>{if(current().paused)play();else{state.stopped=true;pending=false;current().pause();persist();onchange();}};
    $('#music-stop').onclick=stop;
    $('#music-random').onclick=()=>{state.mode='random';random();play();onchange();};
    player.querySelectorAll('[data-music-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.musicMode;music.loop=state.mode==='repeat';persist();onchange();});
    $('#music-volume').oninput=e=>{state.volume=+e.target.value/100;music.volume=ending.volume=state.volume;persist();onchange();}; onchange();
  }
  return {fx,clearFx,enterEnding,leaveEnding,mount,state,setSfx(v){state.sfx=clamp(v);persist();},play,stop,reset};
}
