import styles from './PreviewCard.module.scss'

export default function PreviewCard() {
  return (
    <div className={styles.card}>
      <p className={styles.label}>적합도 점수</p>
      <div className={styles.score}>
        <span className={styles.num}>84.2</span>
        <span className={styles.unit}>/100</span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: '84%' }} />
      </div>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricValue}>91.5</span>
          <span className={styles.metricLabel}>이미지</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>낮음</span>
          <span className={styles.metricLabel}>리스크</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>정상</span>
          <span className={styles.metricLabel}>허수</span>
        </div>
      </div>
    </div>
  )
}
