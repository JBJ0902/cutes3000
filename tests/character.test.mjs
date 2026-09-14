import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const url=new URL('../dist/character-motion.js',import.meta.url),source=readFileSync(url,'utf8');
const events={},store=new Map();const actor={style:{},setAttribute(){},src:'',alt:''};
const host={dataset:{mood:'0'},isConnected:true,querySelector:()=>actor,getBoundingClientRect:()=>({top:0,bottom:450})};
let hidden=false,paused=false,callback,loads=[],ticks=0;
const doc={querySelector:s=>s==='.motion-host'?host:null,querySelectorAll:()=>[],documentElement:{dataset:{}},get hidden(){return hidden;},addEventListener:(k,v)=>events[k]=v};
const ctx=vm.createContext({document:doc,localStorage:{getItem:()=>null,setItem:(k,v)=>store.set(k,v)},Image:class{set src(value){this.path=value;loads.push(this);}},matchMedia:()=>({matches:false,addEventListener(){}}),performance:{now:()=>0},requestAnimationFrame:fn=>{callback=fn;return ++ticks;},cancelAnimationFrame(){callback=null;},innerHeight:800,Math,Number,Map,Set,String});
vm.runInContext(source.replaceAll('export ',''),ctx);
assert.equal(vm.runInContext('framePosition(0)',ctx),'0');assert.equal(vm.runInContext('framePosition(23)',ctx),'23');
assert.equal(vm.runInContext('frameSource(0,"classic")',ctx),'assets/character-poses/classic-00.webp');assert.equal(vm.runInContext('frameSource(23,"floral")',ctx),'assets/character-poses/floral-23.webp');
for(let base=0;base<8;base++)for(const kind of ['blink','tilt','wave','cheer']){const frames=vm.runInContext(`idleSequence(${base},'${kind}')`,ctx);assert.equal(frames.at(-1)[0],base);for(const [f,ms] of frames){assert(f>=0&&f<24);assert(ms>0);}}
ctx.pauseCheck=()=>paused;vm.runInContext('initCharacter(pauseCheck)',ctx);assert.equal(loads.length,48);assert.equal(host.dataset.ready,'false');loads.slice(0,24).forEach(x=>x.onload());assert.equal(host.dataset.ready,'true');
for(let i=1;i<2000;i++)callback(i*16);assert(actor.style.transform.includes('scale'));assert(actor.src.includes('classic-'));
paused=true;callback(32010);assert.equal(actor.style.transform,'none');paused=false;
events.click({target:{closest:s=>s==='[data-character-outfit]'?{dataset:{characterOutfit:'floral'}}:null}});assert.equal(host.dataset.ready,'false');loads.slice(24).forEach(x=>x.onload());assert.equal(host.dataset.ready,'true');assert(actor.src.includes('floral-'));
events.click({target:{closest:s=>s==='[data-character-motion]'?{}:null}});assert.equal(JSON.parse(store.get('fur-character')).motion,'lively');
hidden=true;events.visibilitychange();assert.equal(callback,null);hidden=false;events.visibilitychange();assert.equal(typeof callback,'function');
for(const outfit of ['classic','floral'])for(let i=0;i<24;i++){const p=new URL(`../dist/assets/character-poses/${outfit}-${String(i).padStart(2,'0')}.webp`,import.meta.url);assert(existsSync(p));const b=readFileSync(p);assert.equal(b.subarray(0,4).toString('hex'),'52494646');}
for(const name of ['app.js','character-motion.js','content.js','engine.js','expansion.js','gallery-data.js','gallery-ui.js']){const p=new URL('../dist/'+name,import.meta.url),s=readFileSync(p,'utf8');for(const m of s.matchAll(/from\s*['"](\.\/[^'"]+)['"]/g))assert(existsSync(new URL(m[1],p)),m[1]);}
console.log('PASS: 48 individual poses, frame bounds, preload/fallback, pause/visibility, compact outfit/motion controls, persistence and module dependencies');
