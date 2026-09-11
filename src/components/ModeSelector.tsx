import { useEffect, useState } from 'react'
import { fetchModes } from '../api/client'
import type { RagMode } from '../api/types'

interface ModeSelectorProps {
  mode: RagMode
  onChange: (mode: RagMode) => void
  disabled: boolean
}

// Only used if the backend is unreachable, so the selector still renders
// something usable. The live list always comes from GET /api/v1/chat/modes.
const FALLBACK_MODES: RagMode[] = ['fixed', 'agentic', 'auto']

const LABELS: Record<RagMode, string> = {
  fixed: 'Fixed',
  agentic: 'Agentic',
  auto: 'Auto',
}

export function ModeSelector({ mode, onChange, disabled }: ModeSelectorProps) {
  const [modes, setModes] = useState<RagMode[]>(FALLBACK_MODES)
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchModes()
      .then((response) => {
        if (cancelled) return
        setModes(response.modes)
        setDescriptions(response.descriptions)
        setOffline(false)
      })
      .catch(() => {
        if (!cancelled) setOffline(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Retrieval mode
        </span>
        {offline && (
          <span
            className="text-xs text-amber-600"
            title="Could not reach GET /api/v1/chat/modes; showing the built-in list."
          >
            (backend list unavailable)
          </span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label="Retrieval mode"
        className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5"
      >
        {modes.map((option) => {
          const isActive = option === mode
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              title={descriptions[option] ?? ''}
              onClick={() => onChange(option)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent'
              }`}
            >
              {LABELS[option] ?? option}
            </button>
          )
        })}
      </div>

      {descriptions[mode] && <p className="text-xs text-gray-500">{descriptions[mode]}</p>}
    </div>
  )
}
