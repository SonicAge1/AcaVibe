import { useState } from 'react'
import { Wand2, Save, RotateCcw, Loader2, Pencil, X, Check } from 'lucide-react'
import { extractAPI } from '../../api/client'
import { useLang } from '../../LangContext'
import IntentTagSelector from '../common/IntentTagSelector'

export default function ExtractorPanel({ intents, onSave, onGoVault }) {
  const { t } = useLang()
  const [text, setText]         = useState('')
  const [intent, setIntent]     = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  // 编辑态
  const [editSkeleton, setEditSkeleton] = useState(false)
  const [skeletonDraft, setSkeletonDraft] = useState('')
  const [editHint, setEditHint] = useState(false)
  const [hintDraft, setHintDraft] = useState('')

  async function handleExtract() {
    if (!text.trim()) return setError(t.errNoText)
    if (!intent) return setError(t.errNoIntent)
    setError(''); setResult(null); setLoading(true); setSaved(false)
    setEditSkeleton(false); setEditHint(false)
    try {
      const res = await extractAPI(text.trim(), intent)
      setResult(res)
    } catch (e) {
      setError(e.response?.data?.error || t.errAI)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      await onSave({
        type: 'skeleton',
        intent,
        skeleton: result.skeleton,
        hint: result.hint,
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
    setText(''); setIntent(''); setResult(null); setError(''); setSaved(false)
    setEditSkeleton(false); setEditHint(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Wand2 size={14} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-700">{t.extractorTitle}</h2>
          <p className="text-xs text-slate-400">{t.extractorDesc}</p>
        </div>
      </div>

      {/* 文本输入 */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">{t.sourceLabel}</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t.sourcePlaceholder}
          rows={4}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent placeholder:text-slate-300 transition"
        />
      </div>

      {/* 意图选择 */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">
          {t.intentLabel} <span className="text-red-400">{t.intentRequired}</span>
        </label>
        <IntentTagSelector intents={intents} value={intent} onChange={setIntent} onGoVault={onGoVault} />
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button onClick={handleExtract} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white text-sm font-medium py-2 rounded-xl transition">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {loading ? t.extracting : t.extractBtn}
        </button>
        <button onClick={handleReset} title={t.resetTitle}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="border border-violet-200 bg-violet-50 rounded-xl p-4 flex flex-col gap-3">
          {/* 骨架 - 可编辑 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-violet-500">{t.skeletonResultLabel}</p>
              {!editSkeleton && (
                <button onClick={() => { setSkeletonDraft(result.skeleton); setEditSkeleton(true) }}
                  className="text-slate-400 hover:text-violet-500 transition" title="编辑">
                  <Pencil size={11} />
                </button>
              )}
            </div>
            {editSkeleton ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={skeletonDraft}
                  onChange={e => setSkeletonDraft(e.target.value)}
                  rows={2}
                  autoFocus
                  className="w-full text-sm font-mono border border-violet-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <div className="flex gap-1.5">
                  <button onClick={() => { setResult(prev => ({...prev, skeleton: skeletonDraft})); setEditSkeleton(false) }}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition">
                    <Check size={10} /> 确认
                  </button>
                  <button onClick={() => setEditSkeleton(false)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 transition">
                    <X size={10} /> 取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-mono text-slate-800 leading-relaxed">{result.skeleton}</p>
            )}
          </div>

          {/* 提示 - 可编辑 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-violet-500">{t.hintResultLabel}</p>
              {!editHint && (
                <button onClick={() => { setHintDraft(result.hint); setEditHint(true) }}
                  className="text-slate-400 hover:text-violet-500 transition" title="编辑">
                  <Pencil size={11} />
                </button>
              )}
            </div>
            {editHint ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={hintDraft}
                  onChange={e => setHintDraft(e.target.value)}
                  rows={2}
                  autoFocus
                  className="w-full text-xs border border-violet-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <div className="flex gap-1.5">
                  <button onClick={() => { setResult(prev => ({...prev, hint: hintDraft})); setEditHint(false) }}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition">
                    <Check size={10} /> 确认
                  </button>
                  <button onClick={() => setEditHint(false)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 transition">
                    <X size={10} /> 取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">{result.hint}</p>
            )}
          </div>

          <button onClick={handleSave} disabled={saving || saved}
            className={`flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl transition ${
              saved ? 'bg-green-100 text-green-600 cursor-default'
                    : 'bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white'}`}>
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> {t.saving}</>
              : saved ? t.saved
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
