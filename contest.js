// Fixed 10ms simulation, seeded surge schedule, integer UP arrival timestamps.
export function createContest(random=Math.random){const names=[['네온크루','하루빛'],['오로라팀','달소미'],['별숲크루','루미온'],['구름연합','구름단'],['모래별팀','별하온'],['푸른파도','파도링']];const seconds=18+Math.floor(random()*11);const opponents=names.map(([crew,name],i)=>({crew,name,id:i+1,follow:i<2?.84+random()*.18:i===2?.82+random()*.12:.55+random()*.25,rate:3.1+random()*1.8,value:0,up:0,arrivals:[0],tie:random(),budget:seconds*(.22+random()*.08),until:0,next:3+random()*3,mult:1}));return {seconds,opponents,random,time:0,steps:0,playerUp:0,playerArrivals:[0],inputs:[],smoothed:0,nextSample:.5,playerTie:random()};}
export function contestRows(c,time,ups){time=Math.max(c.time,Math.min(c.seconds,time));if(ups>c.playerUp){for(let i=c.playerUp+1;i<=ups;i++){c.playerArrivals[i]=time;c.inputs.push(time);}c.playerUp=ups;}
 const steps=Math.floor((time+1e-8)*100);
 while(c.steps<steps){c.steps++;const t=c.steps/100,dt=.01;if(t>=c.nextSample){const rate=c.inputs.filter(x=>x<=t&&x>t-3).length/Math.min(3,t);c.smoothed=c.smoothed*.5+rate*.5;c.nextSample+=.5;}
  let active=c.opponents.filter(o=>o.until>t).length;
  for(const o of c.opponents){if(t>=o.next&&t>=3&&o.budget>0&&active<2){const duration=Math.min(o.budget,.8+c.random()*.6);o.until=t+duration;o.next=o.until+2.2+c.random()*1.2;o.budget-=duration;o.mult=1.15+c.random()*.5;active++;}const cruise=Math.min(12.5,Math.max(o.rate,c.smoothed*o.follow));const rate=o.until>t?Math.min(20,Math.max(cruise,c.smoothed*o.mult)):cruise;o.value+=rate*dt;const next=Math.floor(o.value+1e-9);for(let u=o.up+1;u<=next;u++)o.arrivals[u]=t;o.up=next;}
 }
 c.time=time;return [{id:0,name:'큐티섹시',crew:'버블란',up:c.playerUp,arrival:c.playerArrivals[c.playerUp],tie:c.playerTie},...c.opponents.map(o=>({...o,arrival:o.arrivals[o.up],surging:o.until>time}))].sort((a,b)=>b.up-a.up||a.arrival-b.arrival||a.tie-b.tie);
}
export function contestOutcome(c,ups){const rows=contestRows(c,c.seconds,ups);const rank=rows.findIndex(r=>r.id===0)+1;return {rows:rows.map(({id,name,crew,up})=>({id,name,crew,up})),rank,qualified:rank<=3,ups,score:rank<=3?1-(rank-1)*.1:Math.max(.1,.55-rank*.05)};}
