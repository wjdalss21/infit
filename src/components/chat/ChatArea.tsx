import { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useBrandStore } from '@/stores/brandStore'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useResultStore } from '@/stores/resultStore'
import MessageBubble from './MessageBubble'
import OptionChips from './OptionChips'
import StepChecklist from './StepChecklist'
import InputBar from './InputBar'
import ResultSummary from '@/components/result/ResultSummary'
import RankedCard from '@/components/result/RankedCard'
import type { SubscriberRange, ChannelResult } from '@/types'
import styles from './ChatArea.module.scss'

const Q: Record<string, string> = {
  product:  '안녕하세요! 저는 IN-Fit AI입니다.\nAI가 브랜드에 맞는 인플루언서를 자동으로 탐색하고 평가해드립니다.\n\n어떤 제품을 홍보하고 싶으신가요?\n예: 선크림, 파운데이션, 마스카라',
  features: '제품의 핵심 특징을 입력해주세요.\n예: 지속성, 발색력, 보습력',
  target:   '타겟층을 알려주세요.\n예: 미국 10대 학생들, 직장인 여성 2030',
  keyword:  '검색 키워드를 입력해주세요.\n예: glow, 파운데이션 추천',
  range:    '구독자 범위를 선택해주세요.',
}

const MOCK: ChannelResult[] = [
  { rank:1, channelId:'ch1', channelName:'Dear_diarlee',  thumbnailUrl:'', subscriberCount:79000,  scores:{quantitative:91.5,image:88.3,text:72,  total:84.2}, fsi:0.2,  riskFlag:'none', isRecommended:true,  reason:'활발한 활동',         riskTags:[] },
  { rank:2, channelId:'ch2', channelName:'leeskin',       thumbnailUrl:'', subscriberCount:74500,  scores:{quantitative:85,  image:78,  text:74,  total:79.8}, fsi:0.3,  riskFlag:'none', isRecommended:true,  reason:'높은 인게이지먼트',    riskTags:[] },
  { rank:3, channelId:'ch3', channelName:'Kiyoko',        thumbnailUrl:'', subscriberCount:79500,  scores:{quantitative:80,  image:75,  text:70,  total:75.1}, fsi:0.25, riskFlag:'none', isRecommended:true,  reason:'브랜드 톤 일치',       riskTags:[] },
  { rank:4, channelId:'ch4', channelName:'krystallee',    thumbnailUrl:'', subscriberCount:565000, scores:{quantitative:72,  image:73,  text:68,  total:71.4}, fsi:0.35, riskFlag:'none', isRecommended:true,  reason:'뷰티 콘텐츠 특화',     riskTags:[] },
  { rank:5, channelId:'ch5', channelName:'HEMEKO GLOBAL', thumbnailUrl:'', subscriberCount:320000, scores:{quantitative:65,  image:58,  text:60,  total:61.7}, fsi:0.4,  riskFlag:'low',  isRecommended:false, reason:'긍정 감성 부족',       riskTags:['낮은 이미지 품질'] },
  { rank:6, channelId:'ch6', channelName:'beautybyrae',   thumbnailUrl:'', subscriberCount:810000, scores:{quantitative:58,  image:52,  text:50,  total:54.2}, fsi:0.55, riskFlag:'low',  isRecommended:false, reason:'낮은 적합성',          riskTags:['높은 FSI'] },
  { rank:7, channelId:'ch7', channelName:'kbeautyjenny',  thumbnailUrl:'', subscriberCount:231000, scores:{quantitative:50,  image:47,  text:45,  total:47.8}, fsi:0.5,  riskFlag:'low',  isRecommended:false, reason:'텍스트 품질 낮음',     riskTags:['낮은 텍스트 품질'] },
  { rank:8, channelId:'ch8', channelName:'makeuplysofia', thumbnailUrl:'', subscriberCount:61000,  scores:{quantitative:40,  image:35,  text:30,  total:35.6}, fsi:0.6,  riskFlag:'high', isRecommended:false, reason:'리스크 감지',           riskTags:['높은 FSI','리스크 감지'] },
  { rank:9, channelId:'ch9', channelName:'FACES CANADA',  thumbnailUrl:'', subscriberCount:62000,  scores:{quantitative:30,  image:28,  text:25,  total:28.3}, fsi:0.7,  riskFlag:'high', isRecommended:false, reason:'다수 리스크',           riskTags:['높은 FSI','리스크 감지','낮은 이미지 품질','브랜드 불일치'] },
]

export default function ChatArea() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, chatStep, addMessage, setStep } = useChatStore()
  const { setProductName, setFeatures, setTarget, setKeyword, setSubscriberRange, subscriberRange } = useBrandStore()
  const { steps, setStatus, advanceStep } = useAnalysisStore()
  const { setResults, channels, topScore } = useResultStore()

  const recommended    = channels.filter((c) => c.isRecommended)
  const notRecommended = channels.filter((c) => !c.isRecommended)

  useEffect(() => {
    if (messages.length === 0) addMessage({ role: 'ai', content: Q.product })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatStep, steps])

  const ai = (content: string) => setTimeout(() => { addMessage({ role: 'ai', content }) }, 500)

  const handleSend = (text: string) => {
    addMessage({ role: 'user', content: text })
    switch (chatStep) {
      case 'product':  setProductName(text); ai(Q.features); setStep('features'); break
      case 'features': setFeatures(text);    ai(Q.target);   setStep('target');   break
      case 'target':   setTarget(text);      ai(Q.keyword);  setStep('keyword');  break
      case 'keyword':  setKeyword(text);     ai(Q.range);    setStep('range');    break
    }
  }

  const handleRange = (range: SubscriberRange) => {
    setSubscriberRange(range)
    addMessage({ role: 'user', content: range })
    setStep('confirm')

    const { productName, features, target, keyword } = useBrandStore.getState()
    const confirm = `입력 정보를 확인했습니다 ✅\n\n제품명: ${productName}\n제품 특징: ${features}\n타겟층: ${target}\n검색 키워드: ${keyword}\n구독자 범위: ${range}\n\nAI 에이전트가 분석을 시작합니다...`
    setTimeout(() => {
      addMessage({ role: 'ai', content: confirm })
      setStatus('analyzing')
      setStep('analyzing')
      ;[1500, 3000, 5000, 7000, 9000].forEach((delay, i) => {
        setTimeout(() => {
          advanceStep()
          if (i === 4) {
            setTimeout(() => {
              setResults(MOCK)
              setStep('done')
              setStatus('done')
              addMessage({ role: 'ai', content: `분석이 완료되었습니다! 총 ${MOCK.length}개 채널을 평가하였습니다.` })
            }, 1000)
          }
        }, delay)
      })
    }, 600)
  }

  const inputDisabled = ['range', 'confirm', 'analyzing', 'done'].includes(chatStep)
  const isDone = chatStep === 'done'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.title}>분석 진행 중</span>
        <span className={`${styles.badge} ${isDone ? styles.done : ''}`}>
          {isDone ? 'AI 분석 완료' : 'AI 분석 준비됨'}
        </span>
      </header>

      <div className={styles.messages}>
        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}

        {chatStep === 'range'     && <OptionChips onSelect={handleRange} selected={subscriberRange} />}
        {chatStep === 'analyzing' && <StepChecklist />}

        {isDone && channels.length > 0 && (
          <div className={styles.results}>
            <ResultSummary totalCount={channels.length} recommendedCount={recommended.length} topScore={topScore} />
            <div className={styles.list}>
              {recommended.map((ch, i) => <RankedCard key={ch.channelId} result={ch} expanded={i === 0} />)}
              {notRecommended.map((ch)  => <RankedCard key={ch.channelId} result={ch} />)}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <InputBar onSend={handleSend} disabled={inputDisabled} />
    </div>
  )
}
