# InFit — 트러블슈팅 로그

---

## [TRB-001] 결과 카드: 2위 이하 점수 바 미노출

### 현상

분석 완료 후 결과 리스트에서 **1위 채널에만** 정량·이미지·텍스트 점수 바와 추천 이유가 표시되고, 2위·3위·그 이하 채널에는 아무것도 표시되지 않음.

### 원인

`RankedCard` 컴포넌트에 `expanded` prop이 있었고, 점수 상세 영역이 `expanded` 또는 `!isRecommended` 중 하나일 때만 렌더링되도록 조건이 걸려 있었음.

```tsx
// 문제 코드 — ChatArea.tsx
{recommended.map((ch, i) => (
  <RankedCard key={ch.channelId} result={ch} expanded={i === 0} />
))}
```

`i === 0` 조건으로 인해 1위(`index 0`)만 `expanded={true}`, 나머지는 `expanded={false}`.  
비추천 채널은 `!isRecommended` 조건 덕에 상세가 보였지만, 추천 채널 2위~4위는 아무 조건도 충족되지 않아 상세 영역 자체가 DOM에서 제거됨.

```tsx
// 문제 코드 — RankedCard.tsx
{(expanded || !isRecommended) && (
  <div className={styles.detail}>
    ...
  </div>
)}
```

### 수정

`expanded` prop 개념 자체를 제거하고, 모든 카드에서 상세 영역을 무조건 렌더링하도록 변경.

```tsx
// RankedCard.tsx — expanded prop 제거
interface Props { result: ChannelResult }

export default function RankedCard({ result }: Props) {
  ...
  return (
    <div ...>
      <div className={styles.header}>...</div>
      <div className={styles.detail}>   {/* 조건 없이 항상 렌더링 */}
        <ScoreBar label="정량" value={scores.quantitative} />
        <ScoreBar label="이미지" value={scores.image} />
        <ScoreBar label="텍스트" value={scores.text} />
        <p className={styles.reason}>...</p>
      </div>
    </div>
  )
}
```

```tsx
// ChatArea.tsx — expanded prop 제거
{recommended.map((ch) => <RankedCard key={ch.channelId} result={ch} />)}
```

### 교훈

초기에 "1위만 펼쳐 보이고 나머지는 접기" 방식을 기획했다가 기획이 변경됐는데, 컴포넌트 인터페이스(`expanded`)가 그대로 남아 있어서 발생한 불일치. 기획 변경 시 관련 prop·조건도 함께 정리해야 함.

---

## [TRB-002] 헤더 타이틀·뱃지 상태 불일치 (분석 진행 중 + 분석 완료 동시 표시)

### 현상

채팅 분석이 완료된 후 헤더 왼쪽에 "분석 진행 중", 오른쪽에 "AI 분석 완료"가 동시에 표시됨. 상태가 서로 모순되는 텍스트가 나란히 노출.

### 원인

왼쪽 타이틀이 `chatStep`에 관계없이 하드코딩돼 있었고, 오른쪽 뱃지만 `isDone` 조건으로 분기됨.

```tsx
// 문제 코드 — ChatArea.tsx
<span className={styles.title}>분석 진행 중</span>   {/* 항상 고정 */}
<span ...>{isDone ? 'AI 분석 완료' : 'AI 분석 준비됨'}</span>  {/* 오른쪽만 분기 */}
```

### 수정

`chatStep`을 기준으로 왼쪽·오른쪽 모두 파생값으로 계산.

```tsx
const headerTitle = isDone ? '분석 완료' : isAnalyzing ? '분석 진행 중' : '정보 입력 중'
const badgeLabel  = isDone ? 'AI 분석 완료' : isAnalyzing ? '분석 중...' : 'AI 준비됨'
```

| chatStep | 왼쪽 타이틀 | 오른쪽 뱃지 |
|---|---|---|
| product ~ confirm | 정보 입력 중 | AI 준비됨 |
| analyzing | 분석 진행 중 | 분석 중... |
| done | 분석 완료 | AI 분석 완료 |

### 교훈

UI 텍스트를 하드코딩하면 상태가 바뀌어도 반영이 안 됨. 상태에 따라 바뀌는 텍스트는 반드시 상태값에서 파생된 변수로 선언해야 함.

---

## [TRB-003] 빌드 실패 — index.html 누락 (UNRESOLVED_ENTRY)

### 현상

`npm run build` 실행 시 `Cannot resolve entry module index.html` 에러로 빌드 중단.

### 원인

Vite는 루트 디렉토리의 `index.html`을 빌드 엔트리로 사용함. 이전 커밋 과정에서 `index.html`이 스테이징되지 않아 워킹트리에서 삭제됨.

### 수정

git 히스토리에서 초기 커밋의 `index.html`을 복원하고 `lang="ko"`로 수정 후 재커밋.

### 교훈

Vite 프로젝트의 `index.html`은 루트에 항상 존재해야 함. 빌드가 갑자기 실패하면 루트 파일 목록부터 확인할 것.

---

## [TRB-004] 채팅 시작 시 첫 AI 메시지 2개 중복 출력

### 현상

`/app` 진입 시 AI 첫 인사 메시지("어떤 제품을 홍보하고 싶으신가요?")가 2개 연속으로 나타남.

### 원인

React StrictMode(개발 모드)에서 `useEffect`를 두 번 실행함. `ChatArea`의 초기 메시지 추가 effect와 `ChatPage`의 `startNewSession()` 호출 effect가 서로 다른 순서로 두 번씩 실행되면서 messages 배열 초기화와 메시지 추가가 타이밍 경쟁(race) 상태에 빠짐.

```tsx
// 문제 코드 — ChatArea.tsx
useEffect(() => {
  if (messages.length === 0) addMessage({ role: 'ai', content: Q.product })
}, [])

// 문제 코드 — ChatPage.tsx
useEffect(() => {
  if (!currentSessionId) startNewSession()  // messages를 [] 로 초기화
}, [])
```

실행 순서(StrictMode):
1. ChatArea effect → messages=[] → addMessage → messages=[msg]
2. ChatPage effect → startNewSession → messages=[] ← 초기화
3. (StrictMode 두 번째 실행)
4. ChatArea effect → messages=[] → addMessage → messages=[msg] ← 두 번째 추가

### 수정

초기 인사 메시지를 `useEffect`로 추가하는 방식 대신, Zustand 스토어의 **초기 상태값에 포함**하고 `startNewSession()` 도 메시지 포함 상태로 리셋하도록 변경.

```ts
// chatStore.ts
function makeGreeting(): ChatMessage {
  return { id: 'init-greeting', role: 'ai', content: INITIAL_GREETING, timestamp: Date.now() }
}

// 초기 상태
messages: [makeGreeting()],

// startNewSession도 인사 메시지 포함
startNewSession: () =>
  set({ ..., messages: [makeGreeting()], chatStep: 'product' }),
```

`ChatArea`의 `useEffect` 초기 메시지 추가 코드는 완전 제거.

### 교훈

컴포넌트 마운트 시 "최초 1회 실행"을 기대하는 `useEffect`는 StrictMode에서 2회 실행됨. 초기 데이터는 store 초기값으로 넣고, effect는 side effect(API 호출, DOM 조작 등)에만 사용할 것.

---

## [TRB-005] Vercel Serverless Function 404 — api/analyze.ts 미인식

### 현상

분석 시작 후 "분석 중 오류가 발생했습니다. API error 404" 메시지 출력. `/api/analyze` 엔드포인트가 존재하지 않는 것처럼 응답.

### 원인

`api/analyze.ts`를 TypeScript로 작성했으나 프로젝트의 `tsconfig.json`이 `api/` 디렉토리를 컴파일 대상에 포함하지 않음.

```json
// tsconfig.json — api/ 디렉토리 미포함
{
  "references": [
    { "path": "./tsconfig.app.json" },   // src/ 만 포함
    { "path": "./tsconfig.node.json" }   // vite.config.ts 만 포함
  ]
}
```

Vercel은 TypeScript 함수를 컴파일하려 하지만 설정이 없어 인식 실패 → 404 반환. 기존 `api/*.js` 파일들이 모두 JavaScript였던 이유도 동일.

### 수정

`api/analyze.ts` 삭제 후 `api/analyze.js`로 재작성. ES module 문법(`export default`) 유지.

```bash
# 기존 .ts 삭제
rm api/analyze.ts

# .js로 재작성 후 커밋
git add api/analyze.js
```

### 교훈

Vite 프로젝트의 `api/` 디렉토리 서버리스 함수는 프로젝트 TypeScript 설정과 독립적. 별도 tsconfig 없이는 `.js`로 작성해야 Vercel이 정상 인식. 기존 파일 확장자를 먼저 확인할 것.

---

## [TRB-006] 로컬 개발 중 /api/analyze 404 — npm run dev 에서 API 미동작

### 현상

로컬(`http://localhost:5173`)에서 분석 시작 시 `POST /api/analyze 404 (Not Found)` 에러 발생. 배포 환경(Vercel)에서는 정상 동작.

### 원인

`npm run dev`는 Vite 개발 서버만 실행하기 때문에 `api/` 디렉토리의 Vercel Serverless Functions를 처리하지 못함. Vite는 정적 파일과 HMR만 담당하며, `/api/*` 경로에 대한 라우팅 로직이 없음.

```
npm run dev  →  Vite 서버만 실행 (포트 5173)
                /api/* 경로 → 404
```

### 수정

로컬 개발 시 `vercel dev` 명령어 사용. Vercel CLI가 Vite 빌드와 API 함수를 동시에 에뮬레이션함.

```bash
# 기존 (API 동작 안 함)
npm run dev

# 수정 후 (API 포함 전체 스택)
vercel dev   # 또는 npm run dev (package.json에서 vercel dev로 변경)
```

`package.json`의 `dev` 스크립트를 `vercel dev`로 변경하고, 기존 Vite만 실행하는 스크립트는 `dev:vite`로 보존.

### 교훈

Vercel Serverless Functions + Vite 조합에서 로컬 개발은 반드시 `vercel dev`를 사용해야 함. `npm run dev`(Vite 단독)는 API 라우트를 처리하지 못함.

---
