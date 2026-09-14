import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,VIEWERS} from '../dist/engine.js';
import {createAudienceUI} from '../dist/audience-ui.js';

test('v8 QCH markup without qch-value must not abort any activity context',()=>{
 const old={document:globalThis.document,window:globalThis.window,setInterval:globalThis.setInterval};
 const value={innerHTML:''},bar={style:{}};
 const q={querySelector(sel){return sel==='.statline > span:last-child'?value:sel==='.progress span'?bar:null;}};
 const el=()=>({innerHTML:'',open:false,setAttribute(){},addEventListener(){},append(){},querySelector(){return null;}});
 globalThis.document={head:{append(){}},body:{append(){}},createElement:el,addEventListener(){},querySelectorAll(){return [];},querySelector(sel){return sel==='.stats'?{querySelector(){return q;}}:null;}};
 globalThis.window={addEventListener(){}};globalThis.setInterval=()=>0;
 try {
  const state=fresh();state.phase='plan';state.qch=17;
  const ui=createAudienceUI({state:()=>state,seeds:VIEWERS,save(){},toast(){},fx(){},running:()=>true,active:()=>false,modal:el()});
  ui.viewers();
  for(const id of ['game','photo','up','cafe','sing','rhythm','memory','clip','chat','collab']){
   assert.doesNotThrow(()=>ui.context('start',id),id);
  }
  assert.equal(value.innerHTML,'17<span class="label"> / 100</span>');
  assert.equal(bar.style.width,'17%');
 }finally{Object.assign(globalThis,old);}
});
