import styles from './ScoreBar.module.scss'

interface Props { label: string; value: number; maxValue?: number }

export default function ScoreBar({ label, value, maxValue = 100 }: Props) {
  const pct = Math.min((value / maxValue) * 100, 100)
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value.toFixed(1)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
