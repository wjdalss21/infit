import { useNavigate, Link } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import styles from './Sidebar.module.scss'

export default function Sidebar() {
  const navigate = useNavigate()
  const { startNewSession } = useChatStore()

  const handleNew = () => {
    startNewSession()
    navigate('/app')
  }

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo}>IN-Fit</Link>
      <button className={styles.newBtn} onClick={handleNew}>+ 새 분석 시작</button>
    </aside>
  )
}
