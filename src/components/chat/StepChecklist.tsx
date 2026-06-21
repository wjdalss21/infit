import { useAnalysisStore } from '@/stores/analysisStore'
import styles from './StepChecklist.module.scss'

const ICON: Record<string, string> = {
  done: '✓',
  active: '◌',
  pending: '○',
}

export default function StepChecklist() {
  const { steps } = useAnalysisStore()
  return (
    <div className={styles.wrapper}>
      {steps.map((step) => (
        <div key={step.id} className={`${styles.step} ${styles[step.status]}`}>
          <span className={styles.icon}>{ICON[step.status]}</span>
          <span className={styles.label}>{step.label}</span>
        </div>
      ))}
    </div>
  )
}
