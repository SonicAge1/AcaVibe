import { useLang } from '../../LangContext'

export default function IntentTabs({ intents, countMap, activeIntent, onSelect }) {
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
