import type { ChatResponse, IngestResponse, ModesResponse, RagMode } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') return body.detail
  } catch {
    // response body wasn't JSON; fall through to status text
  }
  return `Request failed (${response.status} ${response.statusText})`
}

export async function uploadPdf(file: File): Promise<IngestResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/v1/ingest/pdf`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return response.json()
}

export async function askQuestion(question: string, mode: RagMode = 'fixed'): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, mode }),
  })

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return response.json()
}

/**
 * The selectable modes come from the backend rather than a hard-coded list
 * here, so adding a mode server-side does not require a frontend change.
 */
export async function fetchModes(): Promise<ModesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat/modes`)

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response))
  }

  return response.json()
}
