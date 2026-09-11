import type { ChatMessage } from '../types'
import { RunMetadataPanel } from './RunMetadata'

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2 text-white">
          {message.text}
        </div>
        <span className="mt-1 text-xs text-gray-400">asked in {message.requestedMode} mode</span>
      </div>
    )
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-red-200 bg-red-50 px-4 py-2 text-red-700">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2 text-gray-900">
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.sourcePages.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Sources: {message.sourcePages.map((page) => `p.${page}`).join(', ')}
          </p>
        )}
        <RunMetadataPanel meta={message.meta} />
      </div>
    </div>
  )
}
