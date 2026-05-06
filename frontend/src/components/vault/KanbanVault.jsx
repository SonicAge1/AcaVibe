import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Type, LayoutDashboard, Search, LayoutGrid, GalleryHorizontal, X } from 'lucide-react'
import { useLang } from '../../LangContext'
import FlashCard from './FlashCard'
import Pagination from './Pagination'
import IntentTabs from './IntentTabs'
import CardGrid from './CardGrid'

// 类型静态配置（不含文案）
const TYPE_CONFIG = {
  skeleton: {
    renderIcon: (size = 13) => <BookOpen size={size} />,
    activeDot:   'text-violet-500',
    activeBadge: 'bg-violet-100 text-violet-600',
    emptyHintKey: 'emptySkeletonHint',
    labelKey:    'skeletonType',
  },
  word: {
    renderIcon: (size = 13) => <Type size={size} />,
    activeDot:   'text-sky-500',
    activeBadge: 'bg-sky-100 text-sky-600',
    emptyHintKey: 'emptyWordHint',
    labelKey:    'wordType',
  },
}

export default function KanbanVault({ vault, onDelete, loading }) {
  const { t } = useLang()
  const [activeType, setActiveType]     = useState('skeleton')
  const [activeIntent, setActiveIntent] = useState(null)
  const [cardIndex, setCardIndex]       = useState(0)
  const [viewMode, setViewMode]         = useState('flash')   // 'flash' | 'grid'
  const [query, setQuery]               = useState('')        // 搜索关键词

  const { intents, items } = vault

  // 初始化：选中第一个有内容的意图
  useEffect(() => {
    if (!intents.length || activeIntent) return
    const firstWithContent = intents.find(i =>
      items.some(item => item.type === activeType && item.intent === i)
    )
    setActiveIntent(firstWithContent || intents[0])
  }, [intents, items, activeType, activeIntent])

  // 切换类型：重置索引 & 搜索词
  const handleTypeChange = useCallback((type) => {
    setActiveType(type)
    setCardIndex(0)
    setQuery('')
  }, [])

  // 切换意图：重置索引 & 搜索词
  const handleIntentChange = useCallback((intent) => {
    setActiveIntent(intent)
    setCardIndex(0)
    setQuery('')
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
  const intentCards = activeIntent
    ? items.filter(i => i.type === activeType && i.intent === activeIntent)
    : []

  // 搜索过滤：命中词汇/骨架内容、直译、hint
  const q = query.trim().toLowerCase()
  const currentCards = q
    ? intentCards.filter(i => {
        const content = i.type === 'skeleton' ? i.skeleton : i.word
        return (
          content.toLowerCase().includes(q) ||
          (i.translation || '').toLowerCase().includes(q) ||
          (i.hint || '').toLowerCase().includes(q)
        )
      })
    : intentCards

  const currentCard = currentCards[cardIndex] || null

  // 各类型总数
  const skeletonTotal = items.filter(i => i.type === 'skeleton').length
  const wordTotal     = items.filter(i => i.type === 'word').length

  // 当前类型下各意图计数（搜索时仍显示原始计数）
  const countMap = intents.reduce((acc, intent) => {
    acc[intent] = items.filter(i => i.type === activeType && i.intent === intent).length
    return acc
  }, {})

  const isEmpty = intentCards.length === 0
  const isSearchEmpty = !isEmpty && currentCards.length === 0

  return (
    <section>
      {/* 标题栏 */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard size={18} className="text-indigo-500" />
        <h2 className="text-base font-semibold text-slate-700">{t.vaultTitle}</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>

        <div className="flex-1" />

        {/* 视图切换 */}
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode('flash')}
            title={t.viewFlash}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'flash' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <GalleryHorizontal size={13} /> {t.viewFlash}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title={t.viewGrid}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={13} /> {t.viewGrid}
          </button>
        </div>
      </div>

      {/* 一级 Tab：类型切换 */}
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
      <div className="mb-4">
        <IntentTabs
          intents={intents}
          countMap={countMap}
          activeIntent={activeIntent}
          onSelect={handleIntentChange}
        />
      </div>

      {/* 搜索框 — 仅当意图下有卡片时显示 */}
      {!isEmpty && (
        <div className="relative mb-5">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setCardIndex(0) }}
            placeholder={t.searchPlaceholder}
            className="w-full text-sm border border-slate-200 rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-300 transition"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setCardIndex(0) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* 卡片区 */}
      {isEmpty ? (
        /* 意图下无数据 */
        <div className="flex flex-col items-center justify-center h-52 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <span className={`mb-2 ${cfg.activeDot}`}>{cfg.renderIcon(28)}</span>
          <p className="text-sm">{t.emptyTitle(t.intents[activeIntent] ?? activeIntent, t[cfg.labelKey])}</p>
          <p className="text-xs mt-1.5 text-slate-300">{t[cfg.emptyHintKey]}</p>
        </div>
      ) : isSearchEmpty ? (
        /* 搜索无结果 */
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Search size={22} className="mb-2 text-slate-300" />
          <p className="text-sm">{t.searchEmpty}</p>
          <button onClick={() => setQuery('')} className="mt-2 text-xs text-indigo-400 hover:text-indigo-600 transition">
            ✕ {t.resetTitle}
          </button>
        </div>
      ) : viewMode === 'flash' ? (
        /* 闪卡模式 */
        <div>
          {/* 搜索时显示匹配计数 */}
          {q && (
            <p className="text-xs text-slate-400 mb-3">
              {currentCards.length} / {intentCards.length}
            </p>
          )}
          <div key={currentCard?.id} className="animate-fadeIn">
            {currentCard && <FlashCard item={currentCard} onDelete={handleDelete} />}
          </div>
          <Pagination current={cardIndex} total={currentCards.length} onChange={setCardIndex} />
        </div>
      ) : (
        /* 全览模式 */
        <div>
          {q && (
            <p className="text-xs text-slate-400 mb-3">
              {currentCards.length} / {intentCards.length}
            </p>
          )}
          <CardGrid cards={currentCards} onDelete={handleDelete} />
        </div>
      )}
    </section>
  )
}
