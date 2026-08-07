import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'

interface ChatPanelProps {
  messages: ChatMessage[]
  disabled: boolean
  isSending: boolean
  onSend: (question: string) => void
}

export function ChatPanel({ messages, disabled, isSending, onSend }: ChatPanelProps) {
  const [question, setQuestion] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || disabled || isSending) return
    onSend(trimmed)
    setQuestion('')
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">
            {disabled ? 'Upload a document to start chatting.' : 'Ask a question about your document.'}
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending && <p className="text-sm text-gray-400">Thinking…</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-200 p-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={disabled || isSending}
          placeholder="Ask about your insurance document…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={disabled || isSending || !question.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
