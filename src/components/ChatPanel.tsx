import { useEffect, useRef, useState } from 'react'
import type { RagMode } from '../api/types'
import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'
import { ModeSelector } from './ModeSelector'

interface ChatPanelProps {
  messages: ChatMessage[]
  disabled: boolean
  isSending: boolean
  mode: RagMode
  onModeChange: (mode: RagMode) => void
  compareBoth: boolean
  onCompareBothChange: (compare: boolean) => void
  onSend: (question: string) => void
}

export function ChatPanel({
  messages,
  disabled,
  isSending,
  mode,
  onModeChange,
  compareBoth,
  onCompareBothChange,
  onSend,
}: ChatPanelProps) {
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
            {disabled
              ? 'Upload a document to start chatting.'
              : 'Ask a question about your document.'}
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending && (
          <p className="text-sm text-gray-400">
            {compareBoth ? 'Running both flows…' : 'Thinking…'}
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <ModeSelector mode={mode} onChange={onModeChange} disabled={disabled || isSending} />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={compareBoth}
              disabled={disabled || isSending}
              onChange={(e) => onCompareBothChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
            />
            Compare both flows
          </label>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  )
}
