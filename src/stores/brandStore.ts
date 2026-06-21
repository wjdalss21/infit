import { create } from 'zustand'
import type { BrandInput, SubscriberRange } from '@/types'

interface BrandStore extends BrandInput {
  setProductName: (v: string) => void
  setFeatures: (v: string) => void
  setTarget: (v: string) => void
  setKeyword: (v: string) => void
  setSubscriberRange: (v: SubscriberRange) => void
  reset: () => void
}

const initial: BrandInput = {
  productName: '',
  features: '',
  target: '',
  keyword: '',
  subscriberRange: '',
}

export const useBrandStore = create<BrandStore>((set) => ({
  ...initial,
  setProductName: (productName) => set({ productName }),
  setFeatures: (features) => set({ features }),
  setTarget: (target) => set({ target }),
  setKeyword: (keyword) => set({ keyword }),
  setSubscriberRange: (subscriberRange) => set({ subscriberRange }),
  reset: () => set(initial),
}))
