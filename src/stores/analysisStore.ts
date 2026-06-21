import { create } from 'zustand'
import type { AnalysisStatus, AnalysisStepItem } from '@/types'

interface AnalysisStore {
  status: AnalysisStatus
  currentStep: number
  steps: AnalysisStepItem[]
  setStatus: (status: AnalysisStatus) => void
  advanceStep: () => void
  reset: () => void
}

const defaultSteps: AnalysisStepItem[] = [
  { id: 1, label: '인플루언서 탐색 중...', status: 'pending' },
  { id: 2, label: '콘텐츠 이미지 분석 중...', status: 'pending' },
  { id: 3, label: '텍스트 적합성 평가 중...', status: 'pending' },
  { id: 4, label: '리스크 스크리닝 중...', status: 'pending' },
  { id: 5, label: '최종 점수 산출 중...', status: 'pending' },
]

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  status: 'idle',
  currentStep: 0,
  steps: defaultSteps,
  setStatus: (status) => set({ status }),
  advanceStep: () => {
    const { currentStep, steps } = get()
    const next = currentStep + 1
    if (next > steps.length) return
    set({
      currentStep: next,
      steps: steps.map((s) => {
        if (s.id < next) return { ...s, status: 'done' }
        if (s.id === next) return { ...s, status: 'active' }
        return s
      }),
    })
  },
  reset: () => set({ status: 'idle', currentStep: 0, steps: defaultSteps }),
}))
