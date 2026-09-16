import {changeMood} from './engine.js';

const choice=(id,label,effects)=>({id,label,effects});
export const GUEST_CONTENTS={
  '팀 대항 퀴즈쇼':{intro:'진행자가 마지막 퀴즈의 답을 묻습니다.',choices:[
    choice('team','팀원 의견을 모아 답하기',{loyal:4,favorites:2,mood:2,energy:-1}),
    choice('bold','자신 있게 대표로 답하기',{hype:5,favorites:1,mood:2,energy:-2})
  ]},
  '릴레이 노래 무대':{intro:'다음 노래 파트를 넘겨받았어요.',choices:[
    choice('team','함께 후렴을 부르기',{loyal:3,favorites:2,mood:3,energy:-2}),
    choice('bold','솔로 파트에 도전하기',{hype:6,favorites:1,mood:2,energy:-3})
  ]},
  '협동 미션 챌린지':{intro:'팀의 마지막 장애물이 남았습니다.',choices:[
    choice('team','동료와 타이밍 맞추기',{loyal:4,favorites:2,hype:1,mood:2,energy:-2}),
    choice('bold','앞장서서 길을 열기',{loyal:1,hype:6,favorites:1,mood:2,energy:-3})
  ]},
  '스트리머 토크쇼':{intro:'진행자가 버블란의 매력을 물어봅니다.',choices:[
    choice('team','크루와 팬들에게 감사 전하기',{loyal:4,favorites:3,mood:2,energy:-1}),
    choice('bold','재미있는 방송 에피소드 들려주기',{hype:5,favorites:2,mood:3,energy:-2})
  ]},
  '즉흥 연기 대회':{intro:'예상 밖의 상황극 주제가 나왔어요.',choices:[
    choice('team','상대의 연기를 받아주기',{loyal:3,favorites:2,mood:3,energy:-2}),
    choice('bold','과감한 애드리브 도전하기',{hype:6,favorites:1,mood:3,energy:-3})
  ]},
  '랜덤 팀 게임':{intro:'새 팀원들과 첫 판을 시작합니다.',choices:[
    choice('team','역할을 나누고 함께하기',{loyal:4,favorites:2,hype:1,mood:2,energy:-2}),
    choice('bold','승부수를 제안하기',{loyal:1,hype:6,favorites:1,mood:3,energy:-3})
  ]}
};

const LABELS={loyal:'팬 충성도',favorites:'즐겨찾기',hype:'화제성',energy:'체력',mood:'기분'};
const clamp=value=>Math.min(100,Math.max(0,Number(value)||0));
const signed=value=>value>0?`+${value}`:String(value);
export const guestEffectText=effects=>Object.entries(effects).map(([key,value])=>`${LABELS[key]} ${signed(value)}`).join(' · ');

export function applyGuestChoice(state,content,choiceId){
  const spec=GUEST_CONTENTS[content],selected=spec?.choices.find(v=>v.id===choiceId);
  if(!selected)throw Error('Unknown guest content choice');
  const before=Object.fromEntries(['loyal','favorites','hype','energy','mood'].map(key=>[key,Number(state[key])||0]));
  for(const key of ['loyal','favorites','hype','energy'])if(selected.effects[key])state[key]=clamp(before[key]+selected.effects[key]);
  if(selected.effects.mood)changeMood(state,selected.effects.mood);
  const applied=Object.fromEntries(Object.keys(before).map(key=>[key,(Number(state[key])||0)-before[key]]).filter(([,value])=>value));
  return {id:selected.id,label:selected.label,effects:{...selected.effects},applied};
}
