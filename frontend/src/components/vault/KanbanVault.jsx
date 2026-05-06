import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Type, LayoutDashboard } from 'lucide-react'
import { useLang } from '../../LangContext'
import FlashCard from './FlashCard'
import Pagination from './Pagination'
import IntentTabs from './IntentTabs'

// 类型静态配置（不含文案）
const TYPE_CONFIG = {
  skeleton: {
    renderIcon: (size = 13) => <BookOpen size={size} />,
    activeDot:  'text-violet-500',
    activeBadge:'bg-violet-100 text-violet-600',
    emptyHintKey: 'emptySkeletonHint',
    labelKey:   'skeletonType',
  },
  word: {
    renderIcon: (size = 13) => <Type size={size} />,
    activeDot:  'text-sky-500',
    activeBadge:'bg-sky-100 text-sky-600',
    emptyHintKey: 'emptyWordHint',
    labelKey:   'wordType',
  },
}

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
