const YT = 'https://www.googleapis.com/youtube/v3'
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const RANGES = {
  '1만~10만':  [10_000,  100_000],
  '10만~50만': [100_000, 500_000],
  '50만~':     [500_000, Infinity],
}

function normalize(score) {
  return Math.round(((Math.max(1, Math.min(5, score)) - 1) / 4) * 100)
}

function calcFSI(avgViews, subs) {
  const ratio = avgViews / Math.max(subs, 1)
  return parseFloat(Math.max(0, Math.min(1, 1 - ratio * 20)).toFixed(2))
}

function calcQuantitative(avgViews, subs) {
  const ratio = avgViews / Math.max(subs, 1)
  const raw = Math.min((ratio / 0.05) * 4 + 1, 5)
  return normalize(raw)
}

function calcTotal(expertise, trustworthiness, attractiveness, fsi) {
  const weighted = expertise * 0.4 + trustworthiness * 0.3 + attractiveness * 0.3
  const fsiPenalty = fsi > 0.6 ? 20 : fsi > 0.35 ? 10 : 0
  return Math.max(0, Math.round(weighted - fsiPenalty))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { keyword, subscriberRange, productName, features, target } = req.body
  const YT_KEY = process.env.YOUTUBE_API_KEY
  const GM_KEY = process.env.GEMINI_API_KEY

  try {
    // 1. 채널 검색
    const searchRes = await fetch(
      `${YT}/search?part=snippet&type=channel&q=${encodeURIComponent(keyword)}&maxResults=50&key=${YT_KEY}`
    )
    const searchData = await searchRes.json()
    const channelIds = (searchData.items ?? []).map((i) => i.id.channelId).filter(Boolean)
    if (channelIds.length === 0) return res.status(200).json([])

    // 2. 채널 상세 + 구독자 범위 필터
    const detailRes = await fetch(
      `${YT}/channels?part=snippet,statistics&id=${channelIds.join(',')}&key=${YT_KEY}`
    )
    const detailData = await detailRes.json()
    const [minSub, maxSub] = RANGES[subscriberRange] ?? [0, Infinity]

    const channels = (detailData.items ?? [])
      .map((ch) => ({
        channelId: ch.id,
        channelName: ch.snippet.title,
        thumbnailUrl: ch.snippet.thumbnails?.high?.url ?? ch.snippet.thumbnails?.default?.url ?? '',
        channelUrl: ch.snippet.customUrl
          ? `https://www.youtube.com/${ch.snippet.customUrl}`
          : `https://www.youtube.com/channel/${ch.id}`,
        subscriberCount: parseInt(ch.statistics?.subscriberCount ?? '0'),
        viewCount: parseInt(ch.statistics?.viewCount ?? '0'),
        videoCount: parseInt(ch.statistics?.videoCount ?? '1'),
      }))
      .filter((ch) => ch.subscriberCount >= minSub && (maxSub === Infinity || ch.subscriberCount <= maxSub))
      .slice(0, 12)

    if (channels.length === 0) return res.status(200).json([])

    // 3. 채널별 최근 영상 5개 병렬 수집
    const videosPerChannel = await Promise.all(
      channels.map(async (ch) => {
        try {
          const vRes = await fetch(
            `${YT}/search?part=snippet&channelId=${ch.channelId}&type=video&order=date&maxResults=5&key=${YT_KEY}`
          )
          const vData = await vRes.json()
          return {
            channelId: ch.channelId,
            videos: (vData.items ?? []).map((v) => ({
              title: v.snippet?.title ?? '',
              description: (v.snippet?.description ?? '').slice(0, 300),
            })),
          }
        } catch {
          return { channelId: ch.channelId, videos: [] }
        }
      })
    )

    const videoMap = Object.fromEntries(videosPerChannel.map((v) => [v.channelId, v.videos]))

    // 4. Gemini 배치 분석
    const channelTexts = channels
      .map((ch) => {
        const vids = videoMap[ch.channelId] ?? []
        const vidText = vids.map((v, i) => `  영상${i + 1}: ${v.title} — ${v.description}`).join('\n')
        return `[channelId: ${ch.channelId}]\n채널명: ${ch.channelName}\n구독자: ${ch.subscriberCount.toLocaleString()}\n최근영상:\n${vidText}`
      })
      .join('\n\n---\n\n')

    const prompt = `당신은 뷰티 인플루언서 마케팅 전문가입니다.

브랜드 정보:
- 제품명: ${productName}
- 제품 특징: ${features}
- 타겟층: ${target}

아래 유튜브 채널들을 분석하여 각 채널에 대해 1~5점으로 평가해주세요.

평가 기준:
- attractiveness(매력성): 콘텐츠의 시각적 매력도, 소비자 반응 유발력, 브랜드 친화성
- trustworthiness(신뢰성): 콘텐츠 투명성, 진정성, 광고 표시 여부, 일관성
- expertise(전문성): 뷰티 도메인 지식 수준, 콘텐츠 깊이, 전문성

채널 목록:
${channelTexts}

반드시 아래 JSON 형식으로만 응답하세요. channelId는 위 목록의 값 그대로 사용:
{
  "channels": [
    {
      "channelId": "문자열",
      "attractiveness": 숫자,
      "trustworthiness": 숫자,
      "expertise": 숫자,
      "reason": "한 문장 평가 이유"
    }
  ]
}`

    const geminiRes = await fetch(`${GEMINI}?key=${GM_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
    let geminiMap = {}
    try {
      const parsed = JSON.parse(rawText)
      geminiMap = Object.fromEntries((parsed.channels ?? []).map((g) => [g.channelId, g]))
    } catch { /* 파싱 실패 시 기본값 사용 */ }

    // 5. 최종 점수 산출 및 정렬
    const results = channels.map((ch) => {
      const g = geminiMap[ch.channelId] ?? { attractiveness: 3, trustworthiness: 3, expertise: 3, reason: '데이터 부족' }
      const avgViews = ch.viewCount / Math.max(ch.videoCount, 1)
      const attractiveness  = normalize(g.attractiveness)
      const trustworthiness = normalize(g.trustworthiness)
      const expertise       = normalize(g.expertise)
      const quantitative    = calcQuantitative(avgViews, ch.subscriberCount)
      const fsi             = calcFSI(avgViews, ch.subscriberCount)
      const total           = calcTotal(expertise, trustworthiness, attractiveness, fsi)
      const riskFlag        = fsi > 0.6 ? 'high' : fsi > 0.35 ? 'low' : 'none'
      const riskTags        = []
      if (fsi > 0.35) riskTags.push('높은 FSI')
      if (riskFlag === 'high') riskTags.push('리스크 감지')

      return {
        channelId: ch.channelId,
        channelName: ch.channelName,
        thumbnailUrl: ch.thumbnailUrl,
        channelUrl: ch.channelUrl,
        subscriberCount: ch.subscriberCount,
        scores: { quantitative, attractiveness, trustworthiness, expertise, total },
        fsi,
        riskFlag,
        isRecommended: total >= 60 && riskFlag !== 'high',
        reason: g.reason ?? '',
        riskTags,
        rank: 0,
      }
    })

    results.sort((a, b) => b.scores.total - a.scores.total)
    results.forEach((r, i) => { r.rank = i + 1 })

    return res.status(200).json(results.slice(0, 10))
  } catch (err) {
    console.error('[analyze] error:', err)
    return res.status(500).json({ error: 'Analysis failed', message: String(err) })
  }
}
