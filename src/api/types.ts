export interface IngestResponse {
  message: string
  filename: string
  total_pages: number
  total_chunks: number
  embedding_dimension: number
}

export interface Source {
  page: number
}

export interface ChatResponse {
  answer: string
  sources: Source[]
}
