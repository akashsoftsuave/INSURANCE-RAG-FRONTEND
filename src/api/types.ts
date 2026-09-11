export interface IngestResponse {
  message: string
  filename: string
  total_pages: number
  total_chunks: number
  embedding_dimension: number
}

export interface Source {
  page: number
  title?: string
}

/**
 * The RAG flow a request asks for. `auto` is not a flow — it asks the backend
 * to pick one, which it does in app/services/rag_router.py. The client never
 * decides; it only reports back which flow actually ran.
 */
export type RagMode = 'fixed' | 'agentic' | 'auto'

export interface ModesResponse {
  modes: RagMode[]
  default: RagMode
  descriptions: Record<string, string>
}

export interface TokenUsage {
  prompt: number
  completion: number
  total: number
}

export interface Routing {
  requested_mode: RagMode
  resolved_mode: 'fixed' | 'agentic'
  routed_by: 'explicit' | 'auto_classifier'
  explanation: string
  fired: string[]
  signals: Record<string, boolean | number>
}

export interface ChatResponse {
  answer: string
  sources: Source[]
  trace_id?: string

  // Present on every answer from the current backend. Optional because the
  // route sets response_model_exclude_none, and because an older backend
  // simply omits them.
  mode?: 'fixed' | 'agentic'
  requested_mode?: RagMode
  rounds?: number
  queries?: string[]
  latency_ms?: number
  tokens?: TokenUsage
  cost_usd?: number
  routing?: Routing
}
