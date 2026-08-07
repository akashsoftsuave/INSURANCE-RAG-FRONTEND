export interface DocumentStatus {
  filename: string
  totalPages: number
  totalChunks: number
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; text: string; sourcePages: number[] }
  | { id: string; role: 'error'; text: string }
