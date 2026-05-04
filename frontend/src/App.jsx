import { useVault } from './hooks/useVault'
import { saveItem } from './api/client'
import { useLang } from './LangContext'
import KanbanVault from './components/KanbanVault'
import ExtractorPanel from './components/ExtractorPanel'
import VibeTranslator from './components/VibeTranslator'
import { GraduationCap } from 'lucide-react'

export default function App() {
  const { vault, loading, error, deleteItem, refetch } = useVault()
  const { t, lang, toggleLang } = useLang()

  async function handleSave(item) {
    await saveItem(item)
    await refetch()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center">
          <GraduationCap size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-800 leading-none">{t.appName}</h1>
          <p className="text-xs text-slate-400">{t.appDesc}</p>
        </div>
        {/* 语言切换按钮 */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition-all"
          title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
        >
          <span className="text-base leading-none">{lang === 'zh' ? '🇺🇸' : '🇨🇳'}</span>
          <span>{lang === 'zh' ? 'EN' : '中文'}</span>
        </button>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col gap-6">
        {/* 上方：两个工具并排 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ExtractorPanel intents={vault.intents} onSave={handleSave} />
          <VibeTranslator intents={vault.intents} onSave={handleSave} />
        </div>

        {/* 下方：看板 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {error ? (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          ) : (
            <KanbanVault vault={vault} onDelete={deleteItem} loading={loading} />
          )}
        </div>
      </main>
    </div>
  )
}
