import type { BrandInput, ChannelResult } from '@/types'

export async function analyzeChannels(input: BrandInput): Promise<ChannelResult[]> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `API error ${res.status}`)
  }
  return res.json()
}
