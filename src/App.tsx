import { useState } from 'react'
import { askQuestion } from './api/client'
import { ChatPanel } from './components/ChatPanel'
import { DocumentPanel } from './components/DocumentPanel'
import type { ChatMessage, DocumentStatus } from './types'

function App() {
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  async function handleSend(question: string) {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: question }
    setMessages((prev) => [...prev, userMessage])
    setIsSending(true)

    try {
      const response = await askQuestion(question)
      const sourcePages = [...new Set(response.sources.map((s) => s.page))].sort((a, b) => a - b)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: response.answer, sourcePages },
      ])
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
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  )
}

export default App
