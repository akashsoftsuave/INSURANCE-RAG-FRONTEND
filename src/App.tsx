import { useState } from 'react'
import { askQuestion } from './api/client'
import type { ChatResponse, RagMode } from './api/types'
import { ChatPanel } from './components/ChatPanel'
import { DocumentPanel } from './components/DocumentPanel'
import type { ChatMessage, DocumentStatus } from './types'

function toAssistantMessage(response: ChatResponse): ChatMessage {
  const sourcePages = [...new Set(response.sources.map((s) => s.page))].sort((a, b) => a - b)
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    text: response.answer,
    sourcePages,
    meta: {
      mode: response.mode,
      requestedMode: response.requested_mode,
      rounds: response.rounds,
      queries: response.queries,
      latencyMs: response.latency_ms,
      tokens: response.tokens,
      costUsd: response.cost_usd,
      routing: response.routing,
      traceId: response.trace_id,
    },
  }
}

function App() {
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [mode, setMode] = useState<RagMode>('fixed')
  const [compareBoth, setCompareBoth] = useState(false)

  async function handleSend(question: string) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: question, requestedMode: mode },
    ])
    setIsSending(true)

    // "Compare both" is purely a client convenience — it sends the same
    // question twice, once per flow. Which flow answers is still entirely the
    // backend's call; the client never routes.
    const modesToRun: RagMode[] = compareBoth ? ['fixed', 'agentic'] : [mode]

    try {
      for (const runMode of modesToRun) {
        const response = await askQuestion(question, runMode)
        setMessages((prev) => [...prev, toAssistantMessage(response)])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'error',
          text: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Akash AI — Insurance Assistant</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 border-r border-gray-200 bg-white">
          <DocumentPanel documentStatus={documentStatus} onUploaded={setDocumentStatus} />
        </aside>

        <main className="flex-1 overflow-hidden">
          <ChatPanel
            messages={messages}
            disabled={!documentStatus}
            isSending={isSending}
            mode={mode}
            onModeChange={setMode}
            compareBoth={compareBoth}
            onCompareBothChange={setCompareBoth}
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  )
}

export default App
