import { useState, useEffect } from 'react'
import {
  Copy, Trash2, ChevronDown, ChevronUp, Check,
  BookOpen, Type, RotateCcw, Clock, Star
} from 'lucide-react'
import { useLang } from '../../LangContext'

// 类型静态配置
const TYPE_CONFIG = {
  skeleton: {
    renderIcon: (size = 13) => <BookOpen size={size} />,
    cardBadge:  'bg-violet-100 text-violet-600',
    labelKey:   'skeletonType',
  },
  word: {
    renderIcon: (size = 13) => <Type size={size} />,
    cardBadge:  'bg-sky-100 text-sky-600',
    labelKey:   'wordType',
  },
}

// 状态三态配置
const STATUS_CONFIG = {
  unreviewed: {
    icon: (size) => <RotateCcw size={size} />,
    next: 'reviewing',
    btnClass: 'text-slate-400 border-slate-200 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50',
    labelKey: 'statusUnreviewed',
  },
  reviewing: {
    icon: (size) => <Clock size={size} />,
    next: 'mastered',
    btnClass: 'text-amber-500 border-amber-300 bg-amber-50 hover:text-emerald-500 hover:border-emerald-300 hover:bg-emerald-50',
    labelKey: 'statusReviewing',
  },
  mastered: {
    icon: (size) => <Star size={size} />,
    next: 'unreviewed',
    btnClass: 'text-emerald-500 border-emerald-300 bg-emerald-50 hover:text-slate-400 hover:border-slate-200 hover:bg-white',
    labelKey: 'statusMastered',
  },
}

export default function FlashCard({ item, onDelete, onUpdateStatus }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied]     = useState(false)
  const cfg     = TYPE_CONFIG[item.type]
  const status  = item.status || 'unreviewed'
  const sCfg    = STATUS_CONFIG[status]
  const content = item.type === 'skeleton' ? item.skeleton : item.word

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleStatusCycle() {
    onUpdateStatus(item.id, sCfg.next)
  }

  // 切换卡片时收起溯源
  useEffect(() => { setExpanded(false) }, [item.id])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-52">
      {/* 顶部：类型徽章 + 状态标记 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cardBadge}`}>
          {cfg.renderIcon(11)} {t[cfg.labelKey]}
        </span>
        <button
          onClick={handleStatusCycle}
          title={t.markStatus}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${sCfg.btnClass}`}
        >
          {sCfg.icon(11)} {t[sCfg.labelKey]}
        </button>
      </div>

      {/* 核心内容 */}
      <div className="flex-1 px-5 pb-2">
        <p className="text-base font-mono font-medium text-slate-800 leading-relaxed break-words">
          {content}
        </p>
        {item.type === 'word' && item.translation && (
          <p className="text-sm text-indigo-500 font-medium mt-1">{item.translation}</p>
        )}
      </div>

      {/* 提示文字 */}
      <div className="px-5 pb-3">
        <p className="text-sm text-slate-500 leading-relaxed">{item.hint}</p>
      </div>

      {/* 溯源折叠 */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-2 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <span>{t.sourceBtn}</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div className="px-5 pb-3">
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 leading-relaxed break-words whitespace-pre-wrap">
              {item.source}
            </p>
          </div>
        )}
      </div>

      {/* 操作按钮栏 */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl transition-all ${
            copied
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {copied ? <><Check size={14} /> {t.copied}</> : <><Copy size={14} /> {t.copyBtn}</>}
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center justify-center text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-xl transition-all"
          title={t.deleteTitle}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
