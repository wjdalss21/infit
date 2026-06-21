import type { ChatMessage } from '@/types'
import styles from './MessageBubble.module.scss'

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isAI = message.role === 'ai'
  return (
    <div className={`${styles.wrapper} ${isAI ? styles.ai : styles.user}`}>
      {isAI && <div className={styles.avatar}>🤖</div>}
      <div className={`${styles.bubble} ${isAI ? styles.aiBubble : styles.userBubble}`}>
        {message.content}
      </div>
    </div>
  )
}
