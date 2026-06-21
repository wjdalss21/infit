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
