import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import styles from './Sidebar.module.scss'

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  if (d > 0) return `${d}일 전`
  if (h > 0) return `${h}시간 전`
  return '방금 전'
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { sessions, startNewSession } = useChatStore()

  const handleNew = () => {
    startNewSession()
    navigate('/app')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>IN-Fit</div>
      <button className={styles.newBtn} onClick={handleNew}>+ 새 분석 시작</button>
      <div className={styles.section}>
        <p className={styles.sectionTitle}>최근 분석</p>
        <ul className={styles.list}>
          {sessions.map((s) => (
            <li key={s.id} className={styles.item}>
              <span className={styles.icon}>💬</span>
              <div className={styles.info}>
                <span className={styles.title}>{s.title}</span>
                <span className={styles.meta}>{relativeTime(s.createdAt)} · {s.channelCount}개 채널</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
