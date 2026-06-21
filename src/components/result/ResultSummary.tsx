import styles from './ResultSummary.module.scss'

interface Props { totalCount: number; recommendedCount: number; topScore: number }

export default function ResultSummary({ totalCount, recommendedCount, topScore }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stat}>
        <span className={styles.value}>{totalCount}</span>
        <span className={styles.label}>분석 채널</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.value}>{recommendedCount}</span>
        <span className={styles.label}>추천 채널</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.value}>{topScore.toFixed(1)}</span>
        <span className={styles.label}>최고 점수</span>
      </div>
    </div>
  )
}
