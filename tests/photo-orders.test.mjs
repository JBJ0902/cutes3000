import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {PHOTOS} from '../dist/gallery-data.js';
import {PHOTO_POSES,photoOrderSrc} from '../dist/gallery-ui.js';
import {fresh,resolve,valid} from '../dist/engine.js';

assert.equal(PHOTOS.length,10);
assert.deepEqual(PHOTO_POSES,['heart','smile','v']);
const paths=new Set();
for(const photo of PHOTOS){
  assert.equal(photo.src,`assets/gallery/${photo.id}.webp`);
  assert(existsSync(new URL('../dist/'+photo.src,import.meta.url)),`대표 이미지 누락: ${photo.src}`);
  for(const pose of PHOTO_POSES){
    const src=photoOrderSrc(photo.id,pose);
    paths.add(src);
    const path=new URL('../dist/'+src,import.meta.url);
    assert(existsSync(path),`주문 이미지 누락: ${src}`);
    assert.equal(readFileSync(path).subarray(0,4).toString('ascii'),'RIFF',`WebP 형식 오류: ${src}`);
  }
}
assert.equal(paths.size,30);
const source=readFileSync(new URL('../dist/gallery-ui.js',import.meta.url),'utf8');
for(const contract of ['preloadPoses(item)','showRepresentative();if(turn>0)setFeedback','showPose(selectedPose,good)',"poseCache.get(src)?.status==='error'","img.onerror=fallback","good?'주문 성공':'요청과 다른 포즈'"]){
  assert(source.includes(contract),`방셀 동작 계약 누락: ${contract}`);
}
const state=fresh();state.phase='plan';const before=state.balloons;
const result=resolve(state,'photo',.7,{capture:1,orders:5,photoId:'aug-01'});
assert(result.pending.photo.balloons>0);assert.equal(result.balloons-before,result.pending.photo.balloons);
assert.equal(result.log.at(-1).photo.balloons,result.pending.photo.balloons);assert(valid(JSON.parse(JSON.stringify(result))));
console.log('PASS: 방셀 대표 10장 유지, 포즈 파생 30장 경로/형식, 사전 로딩·정오답·복구 동작 계약');
