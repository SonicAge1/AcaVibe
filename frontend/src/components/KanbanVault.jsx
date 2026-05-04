import { useState, useEffect, useCallback } from 'react'
import {
  Copy, Trash2, ChevronDown, ChevronUp, Check,
  BookOpen, Type, ChevronLeft, ChevronRight, LayoutDashboard
} from 'lucide-react'
import { useLang } from '../LangContext'

// 类型静态配置（不含文案，文案由 t 提供）
const TYPE_CONFIG = {
  skeleton: {
    renderIcon: (size = 13) => <BookOpen size={size} />,
    cardBadge:  'bg-violet-100 text-violet-600',
    activeDot:  'text-violet-500',
    activeBadge:'bg-violet-100 text-violet-600',
    emptyHintKey: 'emptySkeletonHint',
    labelKey: 'skeletonType',
  },
  word: {
    renderIcon: (size = 13) => <Type size={size} />,
    cardBadge:  'bg-sky-100 text-sky-600',
    activeDot:  'text-sky-500',
    activeBadge:'bg-sky-100 text-sky-600',
    emptyHintKey: 'emptyWordHint',
    labelKey: 'wordType',
  },
}

// ── 单张闪卡 ──────────────────────────────────────────────
function FlashCard({ item, onDelete }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied]     = useState(false)
  const cfg     = TYPE_CONFIG[item.type]
  const content = item.type === 'skeleton' ? item.skeleton : item.word

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  useEffect(() => { setExpanded(false) }, [item.id])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-52">
      {/* 类型徽章 */}
      <div className="flex items-center px-5 pt-4 pb-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cardBadge}`}>
          {cfg.renderIcon(11)} {t[cfg.labelKey]}
        </span>
      </div>

      {/* 核心内容 */}
      <div className="flex-1 px-5 pb-2">
        <p className="text-base font-mono font-medium text-slate-800 leading-relaxed break-words">
          {content}
        </p>
      </div>

      {/* 中文/英文提示 */}
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
          {copied
            ? <><Check size={14} /> {t.copied}</>
            : <><Copy size={14} /> {t.copyBtn}</>
          }
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

// ── 翻页导航 ─────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
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

// ── 意图 Tab 行 ───────────────────────────────────────────
function IntentTabs({ intents, countMap, activeIntent, onSelect }) {
  const { t } = useLang()
  return (
    <div className="flex flex-wrap gap-2">
      {intents.map(intent => {
        const count    = countMap[intent] || 0
        const isActive = intent === activeIntent
        return (
          <button
            key={intent}
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
                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── 主组件 ───────────────────────────────────────────────
export default function KanbanVault({ vault, onDelete, loading }) {
  const { t } = useLang()
  const [activeType, setActiveType]     = useState('skeleton')
  const [activeIntent, setActiveIntent] = useState(null)
  const [cardIndex, setCardIndex]       = useState(0)

  const { intents, items } = vault

  // 初始化：选中第一个有内容的意图
  useEffect(() => {
    if (!intents.length || activeIntent) return
    const firstWithContent = intents.find(i =>
      items.some(item => item.type === activeType && item.intent === i)
    )
    setActiveIntent(firstWithContent || intents[0])
  }, [intents, items, activeType, activeIntent])

  // 切换类型：重置索引，保持当前意图
  const handleTypeChange = useCallback((type) => {
    setActiveType(type)
    setCardIndex(0)
  }, [])

  const handleIntentChange = useCallback((intent) => {
    setActiveIntent(intent)
    setCardIndex(0)
  }, [])

  // 删除后校正索引
  async function handleDelete(id) {
    await onDelete(id)
    setCardIndex(prev => Math.max(0, prev - 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <span className="animate-pulse text-sm">{t.loading}</span>
      </div>
    )
  }

  const cfg = TYPE_CONFIG[activeType]

  // 当前类型 + 意图下的卡片
  const currentCards = activeIntent
    ? items.filter(i => i.type === activeType && i.intent === activeIntent)
    : []

  const currentCard = currentCards[cardIndex] || null

  // 各类型总数
  const skeletonTotal = items.filter(i => i.type === 'skeleton').length
  const wordTotal     = items.filter(i => i.type === 'word').length

  // 当前类型下各意图计数
  const countMap = intents.reduce((acc, intent) => {
    acc[intent] = items.filter(i => i.type === activeType && i.intent === intent).length
    return acc
  }, {})

  return (
    <section>
      {/* 标题栏 */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard size={18} className="text-indigo-500" />
        <h2 className="text-base font-semibold text-slate-700">{t.vaultTitle}</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* 一级 Tab：类型切换（胶囊分段控件） */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
        {(['skeleton', 'word']).map(type => {
          const tcfg    = TYPE_CONFIG[type]
          const count   = type === 'skeleton' ? skeletonTotal : wordTotal
          const isActive = activeType === type
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className={isActive ? tcfg.activeDot : 'text-slate-400'}>
                {tcfg.renderIcon(13)}
              </span>
              {t[tcfg.labelKey]}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? tcfg.activeBadge : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 二级 Tab：意图筛选 */}
      <div className="mb-5">
        <IntentTabs
          intents={intents}
          countMap={countMap}
          activeIntent={activeIntent}
          onSelect={handleIntentChange}
        />
      </div>

      {/* 卡片区 */}
      {currentCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <span className={`mb-2 ${cfg.activeDot}`}>
            {cfg.renderIcon(28)}
          </span>
          <p className="text-sm">{t.emptyTitle(t.intents[activeIntent] ?? activeIntent, t[cfg.labelKey])}</p>
          <p className="text-xs mt-1.5 text-slate-300">{t[cfg.emptyHintKey]}</p>
        </div>
      ) : (
        <div>
          <div key={currentCard?.id} className="animate-fadeIn">
            {currentCard && <FlashCard item={currentCard} onDelete={handleDelete} />}
          </div>
          <Pagination current={cardIndex} total={currentCards.length} onChange={setCardIndex} />
        </div>
      )}
    </section>
  )
}
