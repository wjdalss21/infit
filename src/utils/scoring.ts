// Likert 1-5 → 0-100 정규화
export function normalizeScore(score: number): number {
  return Math.round(((Math.max(1, Math.min(5, score)) - 1) / 4) * 100)
}

// FSI (Fake Subscriber Index): 낮을수록 실제 구독자 비율 높음
export function calcFSI(avgViews: number, subscriberCount: number): number {
  const ratio = avgViews / Math.max(subscriberCount, 1)
  return parseFloat(Math.max(0, Math.min(1, 1 - ratio * 20)).toFixed(2))
}

// 정량점수: 평균 조회수 / 구독자수 비율 기반
export function calcQuantitative(avgViews: number, subscriberCount: number): number {
  const ratio = avgViews / Math.max(subscriberCount, 1)
  const raw = Math.min((ratio / 0.05) * 4 + 1, 5)
  return normalizeScore(raw)
}

// 종합점수: 전문성 40% + 신뢰성 30% + 매력성 30% − FSI 감점
export function calcTotal(
  expertise: number,
  trustworthiness: number,
  attractiveness: number,
  fsi: number
): number {
  const weighted = expertise * 0.4 + trustworthiness * 0.3 + attractiveness * 0.3
  const fsiPenalty = fsi > 0.6 ? 20 : fsi > 0.35 ? 10 : 0
  return Math.max(0, Math.round(weighted - fsiPenalty))
}
