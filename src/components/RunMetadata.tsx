import { useState } from 'react'
import type { RunMetadata } from '../types'

function formatLatency(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

function formatCost(usd: number): string {
  // Per-question cost is a fraction of a cent; fixed notation keeps it
  // readable instead of rendering as 6.34e-7.
  return `$${usd.toFixed(6)}`
}

export function RunMetadataPanel({ meta }: { meta: RunMetadata }) {
  const [showQueries, setShowQueries] = useState(false)

  if (!meta.mode) return null

  const isAgentic = meta.mode === 'agentic'
  const wasRouted = meta.requestedMode === 'auto'

  return (
    <div className="mt-3 border-t border-gray-200 pt-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span
          className={`rounded px-1.5 py-0.5 font-medium ${
            isAgentic ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {meta.mode}
        </span>

        {wasRouted && (
          <span
            className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700"
            title={meta.routing?.explanation}
          >
            auto → {meta.mode}
          </span>
        )}

        {meta.rounds !== undefined && (
          <span>
            {meta.rounds} {meta.rounds === 1 ? 'round' : 'rounds'}
          </span>
        )}
        {meta.latencyMs !== undefined && <span>{formatLatency(meta.latencyMs)}</span>}
        {meta.tokens && <span>{meta.tokens.total.toLocaleString()} tokens</span>}
        {meta.costUsd !== undefined && <span>{formatCost(meta.costUsd)}</span>}

        {meta.queries && meta.queries.length > 0 && (
          <button
            type="button"
            onClick={() => setShowQueries((prev) => !prev)}
            className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            {showQueries ? 'hide' : 'show'} {meta.queries.length}{' '}
            {meta.queries.length === 1 ? 'query' : 'queries'}
          </button>
        )}
      </div>

      {wasRouted && meta.routing && (
        <p className="mt-1 text-xs text-gray-400">{meta.routing.explanation}</p>
      )}

      {showQueries && meta.queries && (
        <ol className="mt-2 space-y-1 rounded-md bg-gray-50 p-2 text-xs text-gray-600">
          {meta.queries.map((query, index) => (
            <li key={`${index}-${query}`} className="flex gap-2">
              <span className="shrink-0 text-gray-400">{index + 1}.</span>
              <span className="break-words">{query}</span>
            </li>
          ))}
        </ol>
      )}

      {meta.traceId && (
        <p className="mt-1 font-mono text-[10px] break-all text-gray-300">trace {meta.traceId}</p>
      )}
    </div>
  )
}
