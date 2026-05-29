import { useState, useRef, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useLang } from '../../LangContext'

export default function IntentTabs({ intents, countMap, activeIntent, onSelect, onAddIntent, onRemoveIntent }) {
  const { t } = useLang()
  const [adding, setAdding]     = useState(false)
  const [draft, setDraft]       = useState('')
  const [draftErr, setDraftErr] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function handleConfirm() {
    const name = draft.trim()
    if (!name) { setDraftErr(t.intentCancel); return }
    if (name.length > 16) { setDraftErr(t.intentTooLong); return }
    try {
      await onAddIntent(name)
      setDraft(''); setDraftErr(''); setAdding(false)
    } catch {
      setDraftErr(t.intentDuplicate)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') { setAdding(false); setDraft(''); setDraftErr('') }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {intents.map(intent => {
        const count    = countMap[intent] || 0
        const isActive = intent === activeIntent
        return (
          <div key={intent} className="group/tab relative">
            <button
              onClick={() => onSelect(intent)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                  : count > 0
                    ? 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
                    : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-400'
              }`}
            >
              {t.intents[intent] ?? intent}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
            {/* 空意图删除按钮 */}
            {count === 0 && !isActive && onRemoveIntent && (
              <button
                onClick={() => onRemoveIntent(intent)}
                title={t.intentDeleteTitle}
                className="absolute -top-1 -right-1 hidden group-hover/tab:flex w-4 h-4 items-center justify-center rounded-full bg-red-400 text-white hover:bg-red-500 transition"
              >
                <X size={9} />
              </button>
            )}
          </div>
        )
      })}

      {/* 新增意图 */}
      {adding ? (
        <div className="flex items-center gap-1">
          <div className="relative">
            <input
              ref={inputRef}
              value={draft}
              onChange={e => { setDraft(e.target.value); setDraftErr('') }}
              onKeyDown={handleKeyDown}
              placeholder={t.intentPlaceholder}
              maxLength={16}
              className="text-sm border rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent w-32 transition"
            />
            {draftErr && (
              <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">{draftErr}</p>
            )}
          </div>
          <button onClick={handleConfirm}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition">
            <Check size={12} />
          </button>
          <button onClick={() => { setAdding(false); setDraft(''); setDraftErr('') }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 transition">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition">
          {t.addIntent}
        </button>
      )}
    </div>
  )
}
