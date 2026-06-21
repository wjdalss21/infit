import { create } from 'zustand'
import type { ChatMessage, ChatStep, Session } from '@/types'

export const INITIAL_GREETING = '안녕하세요! 저는 IN-Fit AI입니다.\nAI가 브랜드에 맞는 인플루언서를 자동으로 탐색하고 평가해드립니다.\n\n어떤 제품을 홍보하고 싶으신가요?\n예: 선크림, 파운데이션, 마스카라'

function makeGreeting(): ChatMessage {
  return { id: 'init-greeting', role: 'ai', content: INITIAL_GREETING, timestamp: Date.now() }
}

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
  messages: [makeGreeting()],
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
    set({ currentSessionId: crypto.randomUUID(), messages: [makeGreeting()], chatStep: 'product' }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
}))
