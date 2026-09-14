// DOM-adapter tests, not a real-browser/layout test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh,VIEWERS} from '../dist/engine.js';
import {online,donate,say} from '../dist/audience.js';
import {createAudienceUI} from '../dist/audience-ui.js';
test('UI 생성: 두 피드의 메시지 ID/내용 동일, 명부 인원·후원 강조 수명·문자 이스케이프',()=>{
 const prior={document:globalThis.document,window:globalThis.window,setInterval:globalThis.setInterval};
 const listeners={},elements=[];
 const element=()=>({innerHTML:'',open:false,setAttribute(){},append(){},addEventListener(k,f){this[k]=f;},showModal(){this.open=true;},close(){this.open=false;},querySelector(){return null;}});
 globalThis.document={head:{append(){}},body:{append(x){elements.push(x);}},createElement:element,querySelectorAll(){return [];},querySelector(){return null;},addEventListener(k,f){listeners[k]=f;}};
 globalThis.window={addEventListener(){},dispatchEvent(){}};globalThis.setInterval=()=>0;
 try{
 const s=fresh();s.phase='plan';const ui=createAudienceUI({state:()=>s,seeds:VIEWERS,save(){},toast(){},fx(){},running:()=>true,active:()=>false,modal:element()});
 let main=ui.compactHTML(),lower=ui.feedHTML();for(const m of s.audience.messages){assert(main.includes(`data-message-id="${m.id}"`));assert(lower.includes(`data-message-id="${m.id}"`));assert(main.includes(m.text));assert(lower.includes(m.text));}
 assert(main.includes(`시청자 ${online(s.audience).length}명`));
 const gift=donate(s,online(s.audience)[0],10);assert(ui.compactHTML().includes('chat-balloon'));s.audience.time+=11;assert(!ui.compactHTML().includes('chat-balloon'));assert(ui.feedHTML().includes(`별풍선 ${gift.amount}개`));
 say(s.audience,online(s.audience)[0],'<img src=x onerror=alert(1)>');assert(!ui.compactHTML().includes('<img'));assert(ui.compactHTML().includes('&lt;img'));
 listeners.click({target:{closest:(selector)=>selector==='[data-chat-viewer]'?null:{dataset:{audience:'list'}}}});const dialog=elements[0];assert(dialog.open);assert.equal((dialog.innerHTML.match(/data-viewer-id=/g)||[]).length,online(s.audience).length);assert(ui.paused());
 assert(main.includes('data-chat-viewer="'));assert(main.includes('aria-haspopup="menu"'));assert(ui.feedHTML().includes('data-chat-viewer="'));
 assert(readFileSync(new URL('../dist/audience-ui.js',import.meta.url),'utf8').includes("button.closest('dialog')?.open?button.closest('dialog'):document.body"));
 }finally{globalThis.document=prior.document;globalThis.window=prior.window;globalThis.setInterval=prior.setInterval;}
});
test('답변 성공 시 다이얼로그를 닫고, 실패 시 재입력을 허용하는 소스 계약',()=>{
 const ui=readFileSync(new URL('../dist/audience-ui.js',import.meta.url),'utf8');
 assert(ui.includes("if(out.ok){lastReplyWall=performance.now();save();close();toast(out.message);}"));
 assert(ui.includes("else{dialog.querySelector('#audience-status').textContent=out.message;}"));
});
test('하단 피드는 바깥 스크롤 없이 내부 세로 스크롤 하나와 확장 높이를 사용',()=>{
 const css=readFileSync(new URL('../dist/audience.css',import.meta.url),'utf8');
 assert(css.includes('#app .audience-feed{height:500px!important;max-height:500px!important;min-height:500px!important;'));
 assert(css.includes('#app .audience-feed [data-audience-feed]{height:auto!important;max-height:none!important;'));
 assert(css.includes('overflow:hidden}.audience-feed [data-audience-feed]'));
 assert(css.includes('overflow-y:auto;overflow-x:hidden'));
});
