import type { SubscriberRange } from '@/types'
import styles from './OptionChips.module.scss'

const RANGES: SubscriberRange[] = ['1만~10만', '10만~50만', '50만~']

interface Props {
  onSelect: (range: SubscriberRange) => void
  selected?: SubscriberRange | ''
}

export default function OptionChips({ onSelect, selected }: Props) {
  return (
    <div className={styles.wrapper}>
      {RANGES.map((range) => (
        <button
          key={range}
          className={`${styles.chip} ${selected === range ? styles.active : ''}`}
          onClick={() => onSelect(range)}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
