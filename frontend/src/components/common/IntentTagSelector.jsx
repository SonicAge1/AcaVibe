import { useLang } from '../../LangContext'

export default function IntentTagSelector({ intents, value, onChange, onGoVault }) {
  const { t, lang } = useLang()

  if (!intents || intents.length === 0) {
    return (
      <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2.5 border border-dashed border-slate-200">
        {lang === 'en' ? 'No intents yet. ' : '还没有意图分类。'}
        {onGoVault && (
          <button onClick={onGoVault} className="text-indigo-500 hover:text-indigo-700 underline ml-1 transition">
            {lang === 'en' ? 'Add one in Vault →' : '去词库页添加 →'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {intents.map(intent => (
        <button
          key={intent}
          type="button"
          onClick={() => onChange(intent)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            value === intent
              ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
          }`}
        >
          {t.intents[intent] ?? intent}
        </button>
      ))}
    </div>
  )
}
