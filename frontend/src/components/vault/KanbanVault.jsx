import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Type, LayoutDashboard, Search, LayoutGrid, GalleryHorizontal, X, Trash2, CheckSquare, Download, Upload } from 'lucide-react'
import { useLang } from '../../LangContext'
import { exportVault } from '../../api/client'
import FlashCard from './FlashCard'
import Pagination from './Pagination'
import IntentTabs from './IntentTabs'
import CardGrid from './CardGrid'

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

// 排序函数
function sortCards(cards, mode) {
  const arr = [...cards]
  switch (mode) {
    case 'oldest':   return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'alpha':    return arr.sort((a, b) => {
      const ca = (a.skeleton ?? a.word ?? '').toLowerCase()
      const cb = (b.skeleton ?? b.word ?? '').toLowerCase()
      return ca.localeCompare(cb)
    })
    case 'reviewing': {
      const ORDER = { reviewing: 0, unreviewed: 1, mastered: 2 }
      return arr.sort((a, b) => (ORDER[a.status||'unreviewed'] - ORDER[b.status||'unreviewed']))
    }
    case 'newest':
    default:
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

export default function KanbanVault({ vault, onDelete, onBulkDelete, onUpdateStatus, onAddIntent, onRemoveIntent, onImport, loading }) {
  const { t } = useLang()
  const [activeType, setActiveType]       = useState('skeleton')
  const [activeIntent, setActiveIntent]   = useState(null)
  const [cardIndex, setCardIndex]         = useState(0)
  const [viewMode, setViewMode]           = useState('flash')
  const [query, setQuery]                 = useState('')
  const [statusFilter, setStatusFilter]   = useState('all')
  const [sortMode, setSortMode]           = useState('newest')
  const [selectMode, setSelectMode]       = useState(false)
  const [selectedIds, setSelectedIds]     = useState(new Set())

  const { intents, items } = vault

  useEffect(() => {
    if (!intents.length || activeIntent) return
    const firstWithContent = intents.find(i =>
      items.some(item => item.type === activeType && item.intent === i)
    )
    setActiveIntent(firstWithContent || intents[0])
  }, [intents, items, activeType, activeIntent])

  const handleTypeChange = useCallback((type) => {
    setActiveType(type); setCardIndex(0); setQuery(''); setStatusFilter('all'); setSelectMode(false); setSelectedIds(new Set())
  }, [])

  const handleIntentChange = useCallback((intent) => {
    setActiveIntent(intent); setCardIndex(0); setQuery(''); setStatusFilter('all'); setSelectMode(false); setSelectedIds(new Set())
  }, [])

  async function handleDelete(id) {
    await onDelete(id)
    setCardIndex(prev => Math.max(0, prev - 1))
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    await onBulkDelete([...selectedIds])
    setSelectedIds(new Set())
    setSelectMode(false)
    setCardIndex(0)
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectAll(cards) {
    setSelectedIds(new Set(cards.map(c => c.id)))
  }

  function handleDeselectAll() {
    setSelectedIds(new Set())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <span className="animate-pulse text-sm">{t.loading}</span>
      </div>
    )
  }

  const cfg = TYPE_CONFIG[activeType]

  const intentCards = activeIntent
    ? items.filter(i => i.type === activeType && i.intent === activeIntent)
    : []

  const statusFiltered = statusFilter === 'all'
    ? intentCards
    : intentCards.filter(i => (i.status || 'unreviewed') === statusFilter)

  const q = query.trim().toLowerCase()
  const queryFiltered = q
    ? statusFiltered.filter(i => {
        const content = i.type === 'skeleton' ? i.skeleton : i.word
        return (
          content.toLowerCase().includes(q) ||
          (i.translation || '').toLowerCase().includes(q) ||
          (i.hint || '').toLowerCase().includes(q)
        )
      })
    : statusFiltered

  const currentCards = sortCards(queryFiltered, sortMode)
  const currentCard  = currentCards[cardIndex] || null

  const skeletonTotal = items.filter(i => i.type === 'skeleton').length
  const wordTotal     = items.filter(i => i.type === 'word').length

  const countMap = intents.reduce((acc, intent) => {
    acc[intent] = items.filter(i => i.type === activeType && i.intent === intent).length
    return acc
  }, {})

  const reviewingCount = intentCards.filter(i => (i.status || 'unreviewed') === 'reviewing').length
  const isEmpty        = intentCards.length === 0
  const isFilterEmpty  = !isEmpty && currentCards.length === 0

  return (
    <section>
      {/* 标题栏 */}
      <div className="flex items-center gap-2 mb-4">
        <LayoutDashboard size={18} className="text-indigo-500" />
        <h2 className="text-base font-semibold text-slate-700">{t.vaultTitle}</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
        <div className="flex-1" />
        {/* 导入导出 */}
        <a href={exportVault()} download title={t.exportBtn}
          className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition">
          <Download size={12} /> {t.exportBtn}
        </a>
        <label title={t.importBtn}
          className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition cursor-pointer">
          <Upload size={12} /> {t.importBtn}
          <input type="file" accept=".json" className="hidden" onChange={async e => {
            const file = e.target.files[0]; e.target.value = ''
            if (!file) return
            try {
              const text = await file.text()
              const vault = JSON.parse(text)
              if (!vault.items || !vault.intents) return alert(t.importError)
              await onImport(vault)
              alert(t.importSuccess)
            } catch { alert(t.importError) }
          }} />
        </label>
        {/* 视图切换 */}
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button onClick={() => { setViewMode('flash'); setSelectMode(false) }} title={t.viewFlash}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'flash' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <GalleryHorizontal size={13} /> {t.viewFlash}
          </button>
          <button onClick={() => setViewMode('grid')} title={t.viewGrid}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutGrid size={13} /> {t.viewGrid}
          </button>
        </div>
      </div>

      {/* 类型 Tab */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-xl w-fit">
        {(['skeleton', 'word']).map(type => {
          const tcfg = TYPE_CONFIG[type]
          const count = type === 'skeleton' ? skeletonTotal : wordTotal
          const isActive = activeType === type
          return (
            <button key={type} onClick={() => handleTypeChange(type)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <span className={isActive ? tcfg.activeDot : 'text-slate-400'}>{tcfg.renderIcon(13)}</span>
              {t[tcfg.labelKey]}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? tcfg.activeBadge : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 意图 Tab */}
      <div className="mb-4">
        <IntentTabs
          intents={intents}
          countMap={countMap}
          activeIntent={activeIntent}
          onSelect={handleIntentChange}
          onAddIntent={onAddIntent}
          onRemoveIntent={onRemoveIntent}
        />
      </div>

      {/* 工具栏：搜索 + 状态过滤 + 排序 + 多选按钮 */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-2 mb-5">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-40">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setCardIndex(0) }}
              placeholder={t.searchPlaceholder}
              className="w-full text-sm border border-slate-200 rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-300 transition"
            />
            {query && (
              <button onClick={() => { setQuery(''); setCardIndex(0) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition">
                <X size={13} />
              </button>
            )}
          </div>
          {/* 状态过滤 */}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCardIndex(0) }}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-slate-600 transition">
            <option value="all">{t.statusUnreviewed} + {t.statusReviewing} + {t.statusMastered}</option>
            <option value="reviewing">🔁 {t.statusReviewing}{reviewingCount > 0 ? ` (${reviewingCount})` : ''}</option>
            <option value="mastered">⭐ {t.statusMastered}</option>
            <option value="unreviewed">⬜ {t.statusUnreviewed}</option>
          </select>
          {/* 排序 */}
          {viewMode === 'grid' && (
            <select value={sortMode} onChange={e => setSortMode(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-slate-600 transition">
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="alpha">{t.sortAlpha}</option>
              <option value="reviewing">{t.sortReviewing}</option>
            </select>
          )}
          {/* 多选按钮（只在全览模式显示） */}
          {viewMode === 'grid' && !selectMode && (
            <button onClick={() => setSelectMode(true)}
              className="flex items-center gap-1.5 text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition">
              <CheckSquare size={13} /> {t.selectMode}
            </button>
          )}
          {viewMode === 'grid' && selectMode && (
            <button onClick={() => { setSelectMode(false); setSelectedIds(new Set()) }}
              className="flex items-center gap-1.5 text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-500 hover:border-slate-300 transition">
              <X size={13} /> {t.cancelSelect}
            </button>
          )}
        </div>
      )}

      {/* 卡片区 */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-52 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <span className={`mb-2 ${cfg.activeDot}`}>{cfg.renderIcon(28)}</span>
          <p className="text-sm">{t.emptyTitle(t.intents[activeIntent] ?? activeIntent, t[cfg.labelKey])}</p>
          <p className="text-xs mt-1.5 text-slate-300">{t[cfg.emptyHintKey]}</p>
        </div>
      ) : isFilterEmpty ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
          <Search size={22} className="mb-2 text-slate-300" />
          <p className="text-sm">{t.searchEmpty}</p>
          <button onClick={() => { setQuery(''); setStatusFilter('all') }}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-600 transition">
            ✕ {t.resetTitle}
          </button>
        </div>
      ) : viewMode === 'flash' ? (
        <div>
          {(q || statusFilter !== 'all') && (
            <p className="text-xs text-slate-400 mb-3">{currentCards.length} / {intentCards.length}</p>
          )}
          <div key={currentCard?.id} className="animate-fadeIn">
            {currentCard && <FlashCard item={currentCard} onDelete={handleDelete} onUpdateStatus={onUpdateStatus} />}
          </div>
          <Pagination current={cardIndex} total={currentCards.length} onChange={setCardIndex} />
        </div>
      ) : (
        <div className="relative">
          {(q || statusFilter !== 'all') && (
            <p className="text-xs text-slate-400 mb-3">{currentCards.length} / {intentCards.length}</p>
          )}
          <CardGrid
            cards={currentCards}
            onDelete={handleDelete}
            onUpdateStatus={onUpdateStatus}
            selectMode={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
          {/* 批量操作底部操作栏 */}
          {selectMode && (
            <div className="sticky bottom-4 mt-4 flex items-center gap-3 bg-white border border-slate-200 shadow-lg rounded-2xl px-4 py-3">
              <button onClick={() => selectedIds.size === currentCards.length ? handleDeselectAll() : handleSelectAll(currentCards)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">
                {selectedIds.size === currentCards.length ? t.deselectAll : t.selectAll}
              </button>
              <span className="flex-1 text-sm text-slate-500 text-center tabular-nums">
                {t.selectedCount(selectedIds.size)}
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white transition">
                <Trash2 size={13} /> {t.bulkDelete}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
