import type { RagMode, Routing, TokenUsage } from './api/types'

export interface DocumentStatus {
  filename: string
  totalPages: number
  totalChunks: number
}

/**
 * What the backend reports about how one answer was produced. Kept on the
 * message so the comparison stays visible after scrolling back — the point of
 * the mode selector is to read fixed and agentic answers side by side.
 */
export interface RunMetadata {
  mode?: 'fixed' | 'agentic'
  requestedMode?: RagMode
  rounds?: number
  queries?: string[]
  latencyMs?: number
  tokens?: TokenUsage
  costUsd?: number
  routing?: Routing
  traceId?: string
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string; requestedMode: RagMode }
  | {
      id: string
      role: 'assistant'
      text: string
      sourcePages: number[]
      meta: RunMetadata
    }
  | { id: string; role: 'error'; text: string }
