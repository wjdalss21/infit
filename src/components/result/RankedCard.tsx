import type { ChannelResult } from '@/types'
import Badge from '@/components/common/Badge'
import ScoreBar from './ScoreBar'
import styles from './RankedCard.module.scss'

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
  return n.toLocaleString()
}

interface Props { result: ChannelResult; expanded?: boolean }

export default function RankedCard({ result, expanded = false }: Props) {
  const { rank, channelName, subscriberCount, scores, isRecommended, reason, riskTags } = result
  return (
    <div className={`${styles.card} ${isRecommended ? styles.rec : styles.noRec}`}>
      <div className={styles.header}>
        <div className={styles.rankInfo}>
          <span className={styles.rank}>{rank}위</span>
          <div className={styles.chInfo}>
            <span className={styles.name}>{channelName}</span>
            <span className={styles.subs}>구독자 {fmt(subscriberCount)}</span>
          </div>
        </div>
        <div className={styles.right}>
          <span className={styles.total}>{scores.total.toFixed(1)}</span>
          <Badge variant={isRecommended ? 'success' : 'danger'}>
            {isRecommended ? '추천' : '비추천'}
          </Badge>
        </div>
      </div>
      {(expanded || !isRecommended) && (
        <div className={styles.detail}>
          <div className={styles.bars}>
            <ScoreBar label="정량" value={scores.quantitative} />
            <ScoreBar label="이미지" value={scores.image} />
            <ScoreBar label="텍스트" value={scores.text} />
          </div>
          <p className={styles.reason}>{isRecommended ? '추천 이유: ' : '비추천 이유: '}{reason}</p>
          {!isRecommended && riskTags.length > 0 && (
            <div className={styles.tags}>
              {riskTags.map((t) => <Badge key={t} variant="danger">{t}</Badge>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
