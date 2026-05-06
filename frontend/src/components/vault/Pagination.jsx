import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ current, total, onChange }) {
  const canPrev = current > 0
  const canNext = current < total - 1

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft'  && canPrev) onChange(current - 1)
      if (e.key === 'ArrowRight' && canNext) onChange(current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, canPrev, canNext, onChange])

  if (total === 0) return null

  const dotCount = Math.min(total, 8)

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        onClick={() => onChange(current - 1)}
        disabled={!canPrev}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: dotCount }).map((_, i) => {
          const targetIndex = total <= 8 ? i : Math.round(i * (total - 1) / (dotCount - 1))
          const isActive    = total <= 8 ? i === current : targetIndex === current
          return (
            <button
              key={i}
              onClick={() => onChange(targetIndex)}
              className={`rounded-full transition-all ${isActive ? 'w-4 h-2 bg-indigo-500' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`}
            />
          )
        })}
      </div>

      <button
        onClick={() => onChange(current + 1)}
        disabled={!canNext}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={16} />
      </button>

      <span className="text-xs text-slate-400 tabular-nums min-w-10 text-center">
        {current + 1} / {total}
      </span>
    </div>
  )
}
