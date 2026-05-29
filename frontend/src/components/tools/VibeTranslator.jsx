import { useState } from 'react'
import { Sparkles, Save, RotateCcw, Loader2, Check } from 'lucide-react'
import { translateAPI } from '../../api/client'
import { useLang } from '../../LangContext'
import IntentTagSelector from '../common/IntentTagSelector'

export default function VibeTranslator({ intents, onSave, onGoVault }) {
  const { t } = useLang()
  const [text, setText]             = useState('')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected]     = useState(null)
  const [intent, setIntent]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')
  const [showIntent, setShowIntent] = useState(false)

  async function handleTranslate() {
    if (!text.trim()) return setError(t.errNoInput)
    setError('')
    setCandidates([])
    setSelected(null)
    setShowIntent(false)
    setSaved(false)
    setLoading(true)
    try {
      const res = await translateAPI(text.trim())
      setCandidates(res.candidates || [])
    } catch (e) {
      setError(e.response?.data?.error || t.errAI)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectCandidate(index) {
    setSelected(index)
    setShowIntent(true)
    setIntent('')
    setSaved(false)
  }

  async function handleSave() {
    if (selected === null || !intent) return setError(t.errNoIntent)
    const candidate = candidates[selected]
    setSaving(true)
    try {
      await onSave({
        type: 'word',
        intent,
        word: candidate.word,
        translation: candidate.translation,
        hint: candidate.hint,
        source: text.trim(),
      })
      setSaved(true)
    } catch (e) {
      setError(t.errSave)
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setText('')
    setCandidates([])
    setSelected(null)
    setIntent('')
    setShowIntent(false)
    setError('')
    setSaved(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
          <Sparkles size={14} className="text-sky-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700">{t.translatorTitle}</h2>
          <p className="text-xs text-slate-400">{t.translatorDesc}</p>
        </div>
      </div>

      {/* 输入 */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">{t.inputLabel}</label>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTranslate()}
            placeholder={t.inputPlaceholder}
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent placeholder:text-slate-300 transition"
          />
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition whitespace-nowrap"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? t.translating : t.translateBtn}
          </button>
          <button
            onClick={handleReset}
            title={t.resetTitle}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* 候选词卡片 */}
      {candidates.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">{t.candidatesLabel}</p>
          <div className="flex flex-col gap-2">
            {candidates.map((c, i) => (
              <button
                key={i}
                onClick={() => handleSelectCandidate(i)}
                className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  selected === i
                    ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-200'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 mb-0.5">
                    {c.word}
                    {c.translation && (
                      <span className="ml-2 text-xs font-normal text-indigo-400">{c.translation}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.hint}</p>
                </div>
                {selected === i && (
                  <span className="flex items-center gap-1 text-sky-500 text-xs font-medium mt-0.5 shrink-0">
                    <Check size={12} /> {t.selectedMark}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 意图归类 */}
      {showIntent && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500 mb-2">
            {t.intentClassifyLabel} <span className="text-red-400">{t.intentRequired}</span>
          </p>
          <IntentTagSelector intents={intents} value={intent} onChange={setIntent} />
          <button
            onClick={handleSave}
            disabled={!intent || saving || saved}
            className={`mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl transition ${
              saved
                ? 'bg-green-100 text-green-600 cursor-default'
                : !intent
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white'
            }`}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> {t.saving}</>
              : saved
                ? t.saved
                : <><Save size={14} /> {t.saveBtn}</>
            }
          </button>
          {saved && onGoVault && (
            <button onClick={onGoVault}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition text-center">
              {t.goVault}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
