import { useState, useMemo } from 'react'
import { PenLine, Brain, Shuffle, ArrowLeft, Check, X, ChevronRight } from 'lucide-react'
import { useLang } from '../../LangContext'

// ── 评分函数 ─────────────────────────────────────────────
function scoreAnswer(input, answer) {
  const normalize = s => s.toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, '').replace(/\s+/g, ' ')
  const normInput  = normalize(input)
  const normAnswer = normalize(answer)

  if (normInput === normAnswer) return 'correct'

  // 提取核心词（去掉冠词、介词）
  const stopWords = new Set(['a', 'an', 'the', 'of', 'in', 'to', 'for', 'with', 'by', 'on', 'at'])
  const coreWords = normAnswer.split(' ').filter(w => !stopWords.has(w))
  const matchCount = coreWords.filter(w => normInput.includes(w)).length
  if (matchCount / coreWords.length >= 0.6) return 'partial'

  return 'wrong'
}

// ── 默写模式 ──────────────────────────────────────────────
function DictationMode({ vault, onUpdateStatus, onExit }) {
  const { t, lang } = useLang()
  const [rangeIntent, setRangeIntent] = useState('all')
  const [started, setStarted]         = useState(false)
  const [queue, setQueue]             = useState([])
  const [qIndex, setQIndex]           = useState(0)
  const [input, setInput]             = useState('')
  const [revealed, setRevealed]       = useState(false)
  const [result, setResult]           = useState(null) // 'correct' | 'partial' | 'wrong'
  const [finished, setFinished]       = useState(false)
  const [scoreLog, setScoreLog]       = useState([])   // 记录每题结果

  const { intents, items } = vault

  // 生成题目队列
  function buildQueue() {
    let pool = rangeIntent === 'all'
      ? items
      : items.filter(i => i.intent === rangeIntent)
    // 优先待复习，没有则用全部
    const reviewing = pool.filter(i => (i.status || 'unreviewed') === 'reviewing')
    const source = reviewing.length > 0 ? reviewing : pool
    // Fisher-Yates shuffle
    const arr = [...source]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function handleStart() {
    const q = buildQueue()
    setQueue(q)
    setQIndex(0)
    setInput('')
    setRevealed(false)
    setResult(null)
    setFinished(false)
    setStarted(true)
  }

  function handleReveal() {
    const card = queue[qIndex]
    const answer = card.type === 'skeleton' ? card.skeleton : card.word
    const score = scoreAnswer(input, answer)
    setResult(score)
    setRevealed(true)
    setScoreLog(prev => [...prev, score])
  }

  function handleNext(statusOverride) {
    if (qIndex + 1 >= queue.length) {
      setFinished(true)
      return
    }
    setQIndex(prev => prev + 1)
    setInput('')
    setRevealed(false)
    setResult(null)
  }

  const card = queue[qIndex]

  const RESULT_CONFIG = {
    correct: { label: t.dictationCorrect, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    partial: { label: t.dictationPartial, color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200'     },
    wrong:   { label: t.dictationWrong,   color: 'text-red-500',     bg: 'bg-red-50 border-red-200'         },
  }

  // 空词库
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <PenLine size={36} className="text-slate-300" />
        <p className="text-slate-500 font-medium">{t.dictationEmpty}</p>
        <p className="text-slate-400 text-sm">{t.dictationEmptyHint}</p>
        <button onClick={onExit} className="mt-2 text-sm text-indigo-500 hover:text-indigo-700 transition">← {lang === 'en' ? 'Back' : '返回'}</button>
      </div>
    )
  }

  // 完成结算
  if (finished) {
    const correctCount  = scoreLog.filter(s => s === 'correct').length
    const partialCount  = scoreLog.filter(s => s === 'partial').length
    const wrongCount    = scoreLog.filter(s => s === 'wrong').length
    const total         = scoreLog.length || 1
    const accuracy      = Math.round((correctCount / total) * 100)
    return (
      <div className="max-w-sm mx-auto py-12 flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <Check size={28} className="text-emerald-500" />
        </div>
        <p className="text-xl font-bold text-slate-800">{t.dictationFinished}</p>
        <p className="text-slate-400 text-sm text-center">{t.statsBravo(accuracy)}</p>

        {/* 统计卡片 */}
        <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.statsTitle}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 bg-emerald-50 rounded-xl py-3">
              <p className="text-xl font-bold text-emerald-600">{correctCount}</p>
              <p className="text-xs text-emerald-500">{t.statsCorrect}</p>
            </div>
            <div className="flex flex-col items-center gap-1 bg-amber-50 rounded-xl py-3">
              <p className="text-xl font-bold text-amber-500">{partialCount}</p>
              <p className="text-xs text-amber-400">{t.statsPartial}</p>
            </div>
            <div className="flex flex-col items-center gap-1 bg-red-50 rounded-xl py-3">
              <p className="text-xl font-bold text-red-500">{wrongCount}</p>
              <p className="text-xs text-red-400">{t.statsWrong}</p>
            </div>
          </div>
          {/* 正确率进度条 */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{t.statsAccuracy}</span>
              <span className="font-semibold text-slate-600">{accuracy}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${accuracy}%` }} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={handleStart}
            className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition">
            {t.dictationRestart}
          </button>
          <button onClick={onExit}
            className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:border-slate-300 transition">
            {lang === 'en' ? 'Back' : '返回'}
          </button>
        </div>
      </div>
    )
  }

  // 开始前：选范围
  if (!started) {
    return (
      <div className="max-w-sm mx-auto py-10 flex flex-col gap-5">
        <button onClick={onExit} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition w-fit">
          <ArrowLeft size={12} /> {lang === 'en' ? 'Back' : '返回'}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <PenLine size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{t.dictationTitle}</p>
            <p className="text-xs text-slate-400">{t.dictationDesc}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-2 block">{t.dictationRange}</label>
          <select
            value={rangeIntent}
            onChange={e => setRangeIntent(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="all">{t.dictationRangeAll} ({items.length})</option>
            {intents.map(intent => {
              const count = items.filter(i => i.intent === intent).length
              return count > 0 && (
                <option key={intent} value={intent}>
                  {t.intents[intent] ?? intent} ({count})
                </option>
              )
            })}
          </select>
        </div>

        <button onClick={handleStart}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
          <PenLine size={15} /> {t.dictationStart}
        </button>
      </div>
    )
  }

  // 答题中
  const rCfg = result ? RESULT_CONFIG[result] : null
  const answer = card.type === 'skeleton' ? card.skeleton : card.word

  return (
    <div className="max-w-lg mx-auto py-8 flex flex-col gap-5">
      {/* 进度 */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft size={12} /> {lang === 'en' ? 'Back' : '返回'}
        </button>
        <span className="text-xs text-slate-400 tabular-nums">{qIndex + 1} / {queue.length}</span>
      </div>

      {/* 进度条 */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all"
          style={{ width: `${((qIndex + 1) / queue.length) * 100}%` }}
        />
      </div>

      {/* 提示卡片 */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-medium text-slate-400 mb-2">{lang === 'en' ? 'Hint' : '提示'}</p>
        <p className="text-sm text-slate-700 leading-relaxed">{card.hint}</p>
        {card.type === 'word' && card.translation && (
          <p className="text-xs text-indigo-400 mt-2">{card.translation}</p>
        )}
      </div>

      {/* 输入框 */}
      <div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !revealed) { e.preventDefault(); handleReveal() } }}
          placeholder={t.dictationInput}
          rows={3}
          disabled={revealed}
          className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-slate-300 transition disabled:bg-slate-50"
        />
      </div>

      {/* 揭晓结果 */}
      {revealed && rCfg && (
        <div className={`rounded-xl border p-4 ${rCfg.bg}`}>
          <p className={`text-sm font-semibold mb-1 ${rCfg.color}`}>{rCfg.label}</p>
          <p className="text-xs text-slate-500">{t.dictationAnswer}<span className="font-mono font-medium text-slate-700">{answer}</span></p>
        </div>
      )}

      {/* 操作按钮 */}
      {!revealed ? (
        <button onClick={handleReveal} disabled={!input.trim()}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-xl transition flex items-center justify-center gap-2">
          {t.dictationReveal}
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => { onUpdateStatus(card.id, 'reviewing'); handleNext() }}
            className="flex-1 py-2.5 border border-amber-300 bg-amber-50 text-amber-600 text-sm font-medium rounded-xl hover:bg-amber-100 transition">
            🔁 {t.dictationMarkReviewing}
          </button>
          <button onClick={() => { onUpdateStatus(card.id, 'mastered'); handleNext() }}
            className="flex-1 py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-xl hover:bg-emerald-100 transition">
            ⭐ {t.dictationMarkMastered}
          </button>
          <button onClick={handleNext}
            className="px-4 py-2.5 border border-slate-200 text-slate-500 text-sm font-medium rounded-xl hover:border-slate-300 transition">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── 练习中心主页 ──────────────────────────────────────────
export default function PracticeHub({ vault, onUpdateStatus }) {
  const { t, lang } = useLang()
  const [activeMode, setActiveMode] = useState(null)
  const totalItems = vault?.items?.length ?? 0

  if (activeMode === 'dictation') {
    return <DictationMode vault={vault} onUpdateStatus={onUpdateStatus} onExit={() => setActiveMode(null)} />
  }

  const modes = [
    {
      id: 'dictation',
      icon: <PenLine size={22} className="text-emerald-500" />,
      bg: 'bg-emerald-50',
      titleZh: '默写模式', titleEn: 'Dictation',
      descZh: '看提示，凭记忆写出完整骨架或词汇', descEn: 'See the hint, recall and write the full expression',
      soon: false,
    },
    {
      id: 'mcq',
      icon: <Brain size={22} className="text-amber-500" />,
      bg: 'bg-amber-50',
      titleZh: '选词模式', titleEn: 'Multiple Choice',
      descZh: '看中文语境，从选项中选出正确的学术词汇', descEn: 'Read the context, pick the right academic word',
      soon: true,
    },
    {
      id: 'shuffle',
      icon: <Shuffle size={22} className="text-indigo-500" />,
      bg: 'bg-indigo-50',
      titleZh: '随机复习', titleEn: 'Shuffle Review',
      descZh: '随机抽取词库中的卡片进行快速复习', descEn: 'Random flashcards from your vault for quick review',
      soon: true,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {lang === 'en' ? 'Practice Hub' : '练习中心'}
        </h2>
        <p className="text-slate-400 text-sm">
          {lang === 'en'
            ? `${totalItems} cards in your vault`
            : `词库中已有 ${totalItems} 张卡片`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map(mode => (
          <div
            key={mode.id}
            onClick={() => !mode.soon && setActiveMode(mode.id)}
            className={`relative bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all
              ${mode.soon
                ? 'border-slate-200 opacity-60 cursor-not-allowed'
                : 'border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-md'
              }`}
          >
            {mode.soon && (
              <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                Coming Soon
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl ${mode.bg} flex items-center justify-center`}>
              {mode.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {lang === 'en' ? mode.titleEn : mode.titleZh}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {lang === 'en' ? mode.descEn : mode.descZh}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
