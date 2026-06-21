import { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useBrandStore } from '@/stores/brandStore'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useResultStore } from '@/stores/resultStore'
import { analyzeChannels } from '@/services/infit'
import MessageBubble from './MessageBubble'
import OptionChips from './OptionChips'
import StepChecklist from './StepChecklist'
import InputBar from './InputBar'
import ResultSummary from '@/components/result/ResultSummary'
import RankedCard from '@/components/result/RankedCard'
import type { SubscriberRange } from '@/types'
import styles from './ChatArea.module.scss'

const Q: Record<string, string> = {
  features: '제품의 핵심 특징을 입력해주세요.\n예: 지속성, 발색력, 보습력',
  target:   '타겟층을 알려주세요.\n예: 미국 10대 학생들, 직장인 여성 2030',
  keyword:  '검색 키워드를 입력해주세요.\n예: glow, 파운데이션 추천',
  range:    '구독자 범위를 선택해주세요.',
}

export default function ChatArea() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, chatStep, addMessage, setStep } = useChatStore()
  const { setProductName, setFeatures, setTarget, setKeyword, setSubscriberRange, subscriberRange } = useBrandStore()
  const { steps, setStatus, advanceStep } = useAnalysisStore()
  const { setResults, channels, topScore } = useResultStore()

  const recommended    = channels.filter((c) => c.isRecommended)
  const notRecommended = channels.filter((c) => !c.isRecommended)

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

      // 시각적 단계 진행 (API 응답 대기 중 UX)
      const stepTimers = [2000, 5000, 9000, 13000, 17000].map((delay) =>
        setTimeout(() => advanceStep(), delay)
      )

      // 실제 API 호출
      analyzeChannels({ productName, features, target, keyword, subscriberRange: range })
        .then((results) => {
          stepTimers.forEach(clearTimeout)
          // 모든 단계 완료 처리
          for (let i = 0; i < 5; i++) advanceStep()
          setResults(results)
          setStep('done')
          setStatus('done')
          addMessage({
            role: 'ai',
            content: `분석이 완료되었습니다! 총 ${results.length}개 채널을 평가하였습니다.`,
          })
        })
        .catch((err: Error) => {
          stepTimers.forEach(clearTimeout)
          setStatus('error')
          setStep('confirm')
          addMessage({
            role: 'ai',
            content: `분석 중 오류가 발생했습니다.\n${err.message}\n\n잠시 후 다시 시도해주세요.`,
          })
        })
    }, 600)
  }

  const inputDisabled = ['range', 'confirm', 'analyzing', 'done'].includes(chatStep)
  const isDone      = chatStep === 'done'
  const isAnalyzing = chatStep === 'analyzing'

  const headerTitle = isDone ? '분석 완료' : isAnalyzing ? '분석 진행 중' : '정보 입력 중'
  const badgeLabel  = isDone ? 'AI 분석 완료' : isAnalyzing ? '분석 중...' : 'AI 준비됨'

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.title}>{headerTitle}</span>
        <span className={`${styles.badge} ${isDone ? styles.done : ''}`}>
          {badgeLabel}
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
              {recommended.map((ch) => <RankedCard key={ch.channelId} result={ch} />)}
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
