import { useEffect } from 'react'
import { useChatStore } from '@/stores/chatStore'
import Sidebar from '@/components/chat/Sidebar'
import ChatArea from '@/components/chat/ChatArea'
import styles from './ChatPage.module.scss'

export default function ChatPage() {
  const { startNewSession, currentSessionId } = useChatStore()

  useEffect(() => {
    if (!currentSessionId) startNewSession()
  }, [])

  return (
    <div className={styles.page}>
      <Sidebar />
      <ChatArea />
    </div>
  )
}
