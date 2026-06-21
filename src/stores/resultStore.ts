import { create } from 'zustand'
import type { ChannelResult } from '@/types'

interface ResultStore {
  channels: ChannelResult[]
  topScore: number
  setResults: (channels: ChannelResult[]) => void
  reset: () => void
}

export const useResultStore = create<ResultStore>((set) => ({
  channels: [],
  topScore: 0,
  setResults: (channels) =>
    set({
      channels,
      topScore: channels.length > 0 ? Math.max(...channels.map((c) => c.scores.total)) : 0,
    }),
  reset: () => set({ channels: [], topScore: 0 }),
}))
