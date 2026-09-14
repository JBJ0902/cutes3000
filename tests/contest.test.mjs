import assert from 'node:assert/strict';
import {createContest,contestRows,contestOutcome} from '../dist/contest.js';
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const report=[];for(const pattern of [2,4,7,12,13,16,'accelerate','decelerate','burst']){let qualified=0,wins=0;for(let seed=1;seed<=1000;seed++){const c=createContest(rng(seed));let count=0,previous=new Map();for(let t=.05;t<=c.seconds+.001;t+=.05){const rate=typeof pattern==='number'?pattern:pattern==='accelerate'?(t<8?2:7):pattern==='decelerate'?(t<8?7:2):(Math.floor(t/2)%2?2:8);count+=rate*.05;const rows=contestRows(c,t,Math.floor(count+1e-6));for(const row of rows){assert(row.up>=(previous.get(row.id)||0));previous.set(row.id,row.up);}}const out=contestOutcome(c,Math.floor(count+1e-6));qualified+=out.qualified;wins+=out.rank===1;}report.push({pattern,qualified:qualified/10+'%',first:wins/10+'%'});}console.log('UP simulation 9000 runs',report);
const normal=report.find(x=>x.pattern===7),fast=report.find(x=>x.pattern===13);
assert(parseFloat(normal.first)>0&&parseFloat(normal.first)<60);
assert(parseFloat(normal.qualified)>20&&parseFloat(normal.qualified)<100);
assert(parseFloat(fast.first)>0&&parseFloat(fast.first)<80);
