import { useLang } from '../LangContext'

export default function IntentTagSelector({ intents, value, onChange }) {
  const { t } = useLang()
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
