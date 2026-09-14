import assert from 'node:assert/strict';
import {nextPattern,matches} from '../dist/clip-drag.js';
let p;
for(let i=0;i<1000;i++){const n=nextPattern(p);assert(n.left>=0&&n.right<=100);if(p){assert.notEqual(n.left,p.left);assert.notEqual(n.width,p.width);}assert(matches(n,n.left,n.right));assert(!matches(n,n.left+8,n.right+8));assert(!matches(n,n.left,n.right+8));assert(!matches(n,n.right,n.left));p=n;}
console.log('PASS: 1000 varying intervals, aligned endpoints and length, reversed/offset/overshoot rejection');
