import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fresh,resolve,nextDay,valid} from '../dist/engine.js';
import * as old from '../dist/core-engine.js';
import {PHOTOS,FANARTS,photosForDay,monthForDay,photoRewards} from '../dist/gallery-data.js';
assert.equal(PHOTOS.length,10);assert.equal(FANARTS.length,20);
assert.equal(new Set([...PHOTOS,...FANARTS].map(x=>x.id)).size,30);
for(const item of [...PHOTOS,...FANARTS]){assert(item.ready);const p=new URL('../dist/'+item.src,import.meta.url);assert(existsSync(p));const magic=readFileSync(p).subarray(0,4).toString('hex');assert(['52494646','89504e47'].includes(magic));}
assert.equal(monthForDay(15),8);assert.equal(monthForDay(16),9);
assert.equal(photosForDay(15).length,5);assert(photosForDay(16).every(x=>x.month===9));
const s={...fresh(),phase:'plan'};
const n=resolve(s,'photo',1,{capture:1,orders:6,photoId:'aug-01'});
assert(valid(n));assert.equal(n.balloons,150);assert.equal(n.favorites,73);assert.equal(n.pending.photo.favorites,3);assert.equal(s.balloons,0);
assert.throws(()=>resolve(n,'photo',1,{capture:1,orders:6}));
assert.equal(resolve({...s,favorites:99},'photo',1,{capture:1,orders:6}).pending.photo.favorites,1);
assert.equal(resolve(s,'photo',1,{capture:NaN,orders:NaN}).balloons,0);
assert.equal(resolve(s,'photo',1,{capture:1,orders:0}).favorites,70);
assert.equal(resolve(s,'photo',1,{capture:1,orders:6,photoId:'sep-01'}).photoAlbum.length,0);
assert(photoRewards(1,6,10,1).balloons<150);
assert(photoRewards(1,6,80,4).balloons<150);
assert.equal(photoRewards(10,600,85,1).balloons,150);
let p={...s};for(let day=0;day<46;day++){const id=p.energy<20?'rest':'photo';p=resolve(p,id,1,{capture:1,orders:6,photoId:photosForDay(day)[day%5].id});assert(valid(p));assert(p.favorites<=100);assert(p.balloons<=46*150);p=nextDay(p);assert(valid(p));}
const legacy={...old.fresh()};delete legacy.balloons;delete legacy.photoAlbum;assert(old.valid(legacy));
assert(!valid({...s,balloons:-1}));assert(!valid({...s,photoAlbum:['bad-path']}));
console.log('PASS: 20 image slots, Aug/Sep boundary, reward caps, no double payout, low energy/repetition, 46-day campaign, legacy saves');
