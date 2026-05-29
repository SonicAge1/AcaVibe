import { useState } from 'react'
import { BookOpen, Type, Copy, Trash2, Check, Clock, Star } from 'lucide-react'
import { useLang } from '../../LangContext'

const TYPE_CONFIG = {
  skeleton: {
    renderIcon: (size = 11) => <BookOpen size={size} />,
    badge: 'bg-violet-100 text-violet-600',
    ring:  'hover:ring-violet-300',
    labelKey: 'skeletonType',
  },
  word: {
    renderIcon: (size = 11) => <Type size={size} />,
    badge: 'bg-sky-100 text-sky-600',
    ring:  'hover:ring-sky-300',
    labelKey: 'wordType',
  },
}

function StatusDot({ status }) {
  if (!status || status === 'unreviewed') return null
  if (status === 'reviewing') return (
    <span className="absolute top-2 left-2 w-4 h-4 flex items-center justify-center rounded-full bg-amber-100 text-amber-500 z-10">
      <Clock size={9} />
    </span>
  )
  return (
    <span className="absolute top-2 left-2 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-500 z-10">
      <Star size={9} />
    </span>
  )
}

function GridCell({ item, onDelete, onUpdateStatus, selectMode, isSelected, onToggleSelect }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const cfg     = TYPE_CONFIG[item.type]
  const content = item.type === 'skeleton' ? item.skeleton : item.word

  function handleCopy(e) {
    if (selectMode) { onToggleSelect(item.id); return }
    e.stopPropagation()
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleDelete(e) {
    e.stopPropagation()
    onDelete(item.id)
  }

  return (
    <div
      className={`group relative bg-white border rounded-xl p-3.5 flex flex-col gap-2 cursor-pointer transition-all
        ring-2 ${cfg.ring}
        ${isSelected
          ? 'border-indigo-400 ring-indigo-300 bg-indigo-50'
          : 'border-slate-200 ring-transparent hover:border-slate-300 hover:shadow-sm'
        }`}
      onClick={handleCopy}
      title={selectMode ? undefined : t.gridHint}
    >
      {/* 多选时左上角复选框 */}
      {selectMode && (
        <span className={`absolute top-2 left-2 w-4 h-4 rounded flex items-center justify-center z-10 border
          ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}>
          {isSelected && <Check size={9} />}
        </span>
      )}

      {!selectMode && <StatusDot status={item.status} />}

      <span className={`self-start inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge} ${selectMode ? 'ml-5' : ''}`}>
        {cfg.renderIcon(10)} {t[cfg.labelKey]}
      </span>

      <p className="text-sm font-mono font-medium text-slate-800 leading-snug break-words line-clamp-3">
        {content}
      </p>

      {item.type === 'word' && item.translation && (
        <p className="text-xs text-indigo-500 font-medium">{item.translation}</p>
      )}

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.hint}</p>

      {/* 非多选模式的悬浮操作 */}
      {!selectMode && (
        <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
          <button onClick={handleCopy}
            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
              copied ? 'bg-green-100 text-green-500' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-500'}`}
            title={t.copyBtn}>
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button onClick={handleDelete}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all"
            title={t.deleteTitle}>
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function CardGrid({ cards, onDelete, onUpdateStatus, selectMode, selectedIds, onToggleSelect }) {
  const { t } = useLang()

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400">
        <p className="text-sm">{t.searchEmpty}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map(item => (
        <GridCell
          key={item.id}
          item={item}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          selectMode={selectMode}
          isSelected={selectedIds?.has(item.id) ?? false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
