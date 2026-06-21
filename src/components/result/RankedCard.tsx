import type { ChannelResult } from '@/types'
import Badge from '@/components/common/Badge'
import ScoreBar from './ScoreBar'
import styles from './RankedCard.module.scss'

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만`
  return n.toLocaleString()
}

interface Props { result: ChannelResult }

export default function RankedCard({ result }: Props) {
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
      <div className={styles.detail}>
        <div className={styles.bars}>
          <ScoreBar label="정량점수"  value={scores.quantitative} />
          <ScoreBar label="매력성"    value={scores.attractiveness} />
          <ScoreBar label="신뢰성"    value={scores.trustworthiness} />
          <ScoreBar label="전문성"    value={scores.expertise} />
        </div>
        <p className={styles.reason}>{isRecommended ? '추천 이유: ' : '비추천 이유: '}{reason}</p>
        {riskTags.length > 0 && (
          <div className={styles.tags}>
            {riskTags.map((t) => <Badge key={t} variant="danger">{t}</Badge>)}
          </div>
        )}
      </div>
    </div>
  )
}
