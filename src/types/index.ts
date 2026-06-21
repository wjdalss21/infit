export type MessageRole = 'ai' | 'user'

export type ChatStep =
  | 'product'
  | 'features'
  | 'target'
  | 'keyword'
  | 'range'
  | 'confirm'
  | 'analyzing'
  | 'done'

export type AnalysisStatus = 'idle' | 'collecting' | 'analyzing' | 'done' | 'error'

export type RiskLevel = 'none' | 'low' | 'high'

export type SubscriberRange = '1만~10만' | '10만~50만' | '50만~'

export type StepStatus = 'pending' | 'active' | 'done'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

export interface BrandInput {
  productName: string
  features: string
  target: string
  keyword: string
  subscriberRange: SubscriberRange | ''
}

export interface AnalysisStepItem {
  id: number
  label: string
  status: StepStatus
}

export interface ChannelScore {
  quantitative: number
  image: number
  text: number
  total: number
}

export interface ChannelResult {
  rank: number
  channelId: string
  channelName: string
  thumbnailUrl: string
  subscriberCount: number
  scores: ChannelScore
  fsi: number
  riskFlag: RiskLevel
  isRecommended: boolean
  reason: string
  riskTags: string[]
}

export interface Session {
  id: string
  title: string
  channelCount: number
  createdAt: number
}
