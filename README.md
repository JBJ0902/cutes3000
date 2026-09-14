# 털의 시련
큐티섹시가 버블란에서 박재박 수장님의 46일 시련에 도전하는 정적 웹 게임.

## 실행
압축을 새 폴더에 풀고 `START_GAME.bat`을 실행하세요. 기존 서버가 열려 있으면 먼저 명령 프롬프트에서 `Ctrl+C`로 종료한 뒤 실행합니다. 브라우저는 `http://localhost:8000/`을 열고 `Ctrl+F5`로 새로고침하세요.

수동 실행은 이 폴더에서 `python -m http.server 8000 --directory dist` 후 `http://localhost:8000/`에 접속합니다. 반드시 `dist`를 정적 서버의 문서 폴더로 사용해야 이미지와 ES modules가 정상적으로 로드됩니다.
ES modules를 사용하므로 index.html 더블클릭 대신 HTTP 서버를 이용하세요.
외부 폰트가 차단되어도 기본 시스템 폰트로 플레이됩니다.

## 구조
- dist/index.html, style.css: 게임 화면
- dist/engine.js: 달력, 활동, 점수 계산, 스토리, 저장 검증, 엔딩
- dist/app.js: 화면, 4 미니게임, 음량, 저장·불러오기, 인계 다운로드
- dist/assets/: 캐릭터 및 참조 이미지
- dist/HANDOFF.md: Grok 인계 문서
- tools/asset-queue.json: 미완성 시각 자산 생성 명세
- tools/generate-assets.py: 기본 dry-run, 명시적 실행 시에만 API 호출
- tests/engine.test.mjs: 엔진 및 46일 시뮬레이션

## 테스트
`node --check dist/app.js && node --check dist/character-motion.js && node --test tests/*.mjs`

## 이어 만들기
먼저 dist/HANDOFF.md를 읽으세요. 기본 게임은 외부 AI API 없이 실행됩니다.
AI 이미지 자동 생성은 제작용 도구이며, ChatGPT 토큰을 감지하거나 Grok 대화를 자동 시작하지 않습니다.
