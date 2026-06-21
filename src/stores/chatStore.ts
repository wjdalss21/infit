import { create } from 'zustand'
import type { ChatMessage, ChatStep, Session } from '@/types'

interface ChatStore {
  sessions: Session[]
  currentSessionId: string | null
  messages: ChatMessage[]
  chatStep: ChatStep
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setStep: (step: ChatStep) => void
  startNewSession: () => void
  addSession: (session: Session) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  sessions: [
    { id: '1', title: 'BB Cream 인플루언서 분석', channelCount: 10, createdAt: Date.now() - 7200000 },
    { id: '2', title: '립스틱 브랜드 매칭', channelCount: 8, createdAt: Date.now() - 86400000 },
    { id: '3', title: 'K-beauty 세럼 검색', channelCount: 12, createdAt: Date.now() - 172800000 },
  ],
  currentSessionId: null,
  messages: [],
  chatStep: 'product',
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    })),
  setStep: (chatStep) => set({ chatStep }),
  startNewSession: () =>
    set({ currentSessionId: crypto.randomUUID(), messages: [], chatStep: 'product' }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
}))
