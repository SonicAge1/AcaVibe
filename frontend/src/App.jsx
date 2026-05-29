import { useState } from 'react'
import { useVault } from './hooks/useVault'
import { saveItem } from './api/client'
import { useLang } from './LangContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import KanbanVault from './components/vault/KanbanVault'
import ExtractorPanel from './components/tools/ExtractorPanel'
import VibeTranslator from './components/tools/VibeTranslator'
import PracticeHub from './components/practice/PracticeHub'
import { GraduationCap, Wrench, LayoutDashboard, PenLine } from 'lucide-react'

const TABS = [
  { id: 'tools',    iconFn: (size) => <Wrench size={size} />,         labelZh: '工具',   labelEn: 'Tools'    },
  { id: 'vault',    iconFn: (size) => <LayoutDashboard size={size} />, labelZh: '词库',   labelEn: 'Vault'    },
  { id: 'practice', iconFn: (size) => <PenLine size={size} />,         labelZh: '练习',   labelEn: 'Practice' },
]

export default function App() {
  const { vault, loading, error, deleteItem, updateItemStatus, bulkDelete, refetch } = useVault()
  const { t, lang, toggleLang } = useLang()
  const [activeTab, setActiveTab] = useState('tools')

  async function handleSave(item) {
    await saveItem(item)
    await refetch()
  }

  // 保存后跳词库
  async function handleSaveAndGoVault(item) {
    await handleSave(item)
    setActiveTab('vault')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className="mr-2">
            <h1 className="text-base font-bold text-slate-800 leading-none">{t.appName}</h1>
            <p className="text-xs text-slate-400">{t.appDesc}</p>
          </div>

          <nav className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              const label = lang === 'en' ? tab.labelEn : tab.labelZh
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab.iconFn(13)}
                  {label}
                  {tab.id === 'vault' && vault.items.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                      {vault.items.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex-1" />

          <button onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-500 hover:text-indigo-500 hover:border-indigo-300 transition-all"
            title={lang === 'zh' ? 'Switch to English' : '切换为中文'}>
            <span className="text-base leading-none">{lang === 'zh' ? '🇺🇸' : '🇨🇳'}</span>
            <span>{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>
        </header>

        <main className="max-w-screen-xl mx-auto px-6 py-6">
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExtractorPanel intents={vault.intents} onSave={handleSave} onGoVault={() => setActiveTab('vault')} />
              <VibeTranslator intents={vault.intents} onSave={handleSave} onGoVault={() => setActiveTab('vault')} />
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              {error ? (
                <div className="text-center py-12 text-red-500 text-sm">{error}</div>
              ) : (
                <KanbanVault
                  vault={vault}
                  onDelete={deleteItem}
                  onBulkDelete={bulkDelete}
                  onUpdateStatus={updateItemStatus}
                  loading={loading}
                />
              )}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <PracticeHub vault={vault} onUpdateStatus={updateItemStatus} />
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}
