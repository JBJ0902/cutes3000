export const PHOTOS=[
 ['aug-01','8월 · 여름빛 윙크','창가 햇살 아래 윙크와 손하트',8],
 ['aug-02','8월 · 소다빛 미소','하늘색 리본과 시원한 소다',8],
 ['aug-03','8월 · 야경과 약속','보랏빛 야경 앞 수줍은 미소',8],
 ['aug-04','8월 · 게임 승리 브이','컨트롤러를 든 승리 브이',8],
 ['aug-05','8월 · 꽃보다 큐티','작은 꽃다발과 환한 웃음',8],
 ['sep-01','9월 · 가을 첫 인사','베이지 카디건과 손 인사',9],
 ['sep-02','9월 · 달빛 소원','보름달 아래 두 손 모은 소원',9],
 ['sep-03','9월 · 포근한 티타임','김이 나는 찻잔과 따뜻한 미소',9],
 ['sep-04','9월 · 리본 선물','작은 선물 상자를 내미는 포즈',9],
 ['sep-05','9월 · 마지막까지 함께','별빛 조명 아래 양손 하트',9]
].map(([id,title,description,month])=>({id,title,description,month,src:`assets/gallery/${id}.webp`,ready:true}));
export const FANARTS=[
 ['fanart-01','동글동글 큐티','커다란 리본을 단 2등신 캐릭터'],
 ['fanart-02','별빛 수채화','은은한 수채화로 그린 밤하늘과 미소'],
 ['fanart-03','방송 준비 완료','헤드셋을 쓴 픽셀 아트 캐릭터'],
 ['fanart-04','털뭉치 왕국','작은 털뭉치 응원단의 귀여운 여왕'],
 ['fanart-05','점프는 자신 있어!','별을 잡으려다 쿠션에 폭 들어간 코믹 장면'],
 ['fanart-06','민트초코 토론회','민트 아이스크림 앞 진지한 고민 표정'],
 ['fanart-07','알림 요정','작은 날개와 알림 종을 든 요정'],
 ['fanart-08','간식 수호자','과자 상자를 품에 안고 눈치를 보는 모습'],
 ['fanart-09','달빛 무대','푸른 조명 아래 노래하는 일러스트'],
 ['fanart-10','함께 쌓은 별','작은 별을 모아 커다란 하트를 만드는 장면']
].map(([id,title,description])=>({id,title,description,src:`assets/gallery/${id}.webp`,ready:true}));
export const monthForDay=day=>day<16?8:9;
export const FANART_PLACEHOLDER='assets/gallery/fanart-placeholder.svg';
FANARTS.push(...[
 ['01_봄_벚꽃산책','봄 · 벚꽃 산책','봄날 벚꽃길을 걷는 큐티섹시'],
 ['02_네온_레인_시티','네온 레인 시티','비 내리는 네온 거리의 큐티섹시'],
 ['03_비오는_카페','비 오는 카페','창가에서 비를 바라보는 카페 장면'],
 ['04_고딕_라이브러리','고딕 라이브러리','고딕풍 서재에서 책을 고르는 장면'],
 ['05_월하의_고딕가든','월하의 고딕 가든','달빛 아래 고딕 정원에 선 장면'],
 ['06_여름_바다산책','여름 · 바다 산책','여름 바닷가를 산책하는 장면'],
 ['07_가을_캠퍼스','가을 캠퍼스','가을 캠퍼스에서 맞이하는 하루'],
 ['08_겨울_스노우스트리트','겨울 스노우 스트리트','눈 내리는 겨울 거리의 장면'],
 ['09_붉은달_야행신사','붉은달 야행 신사','붉은 달빛 아래 신사에 선 장면'],
 ['10_핑크_게이머룸','핑크 게이머 룸','핑크빛 게임방에서 즐기는 장면']
].map(([file,title,description])=>({id:`new-${file}`,title,description,src:`assets/gallery/new-fanart/${file}.png`,ready:true})));
export const photosForDay=day=>PHOTOS.filter(p=>p.month===monthForDay(day));
export function photoRewards(capture,orders,energy,streak){
 capture=Number.isFinite(capture)?Math.max(0,Math.min(1,capture)):0;
 orders=Number.isFinite(orders)?Math.max(0,Math.min(6,Math.floor(orders))):0;
 const fatigue=energy<15?.5:energy<30?.75:1;
 const repeat=streak>=3?Math.max(.4,1-(streak-2)*.2):1;
 return {capture,orders,score:capture*.4+orders/6*.6,balloons:Math.floor(orders*(15+10*capture)*fatigue*repeat),favorites:Math.floor(((orders>=1?1:0)+(orders>=3?1:0)+(orders>=5?1:0))*fatigue*repeat)};
}
