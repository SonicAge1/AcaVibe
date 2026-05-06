import { PenLine, Brain, Shuffle } from 'lucide-react'
import { useLang } from '../../LangContext'

/**
 * 练习中心 — 占位模块，预留默写、选词等功能入口
 */
export default function PracticeHub({ vault }) {
  const { t, lang } = useLang()
  const totalItems = vault?.items?.length ?? 0

  const modes = [
    {
      id: 'dictation',
      icon: <PenLine size={22} className="text-emerald-500" />,
      bg: 'bg-emerald-50',
      titleZh: '默写模式',
      titleEn: 'Dictation',
      descZh: '看提示，凭记忆写出完整骨架或词汇',
      descEn: 'See the hint, recall and write the full expression',
      soon: true,
    },
    {
      id: 'mcq',
      icon: <Brain size={22} className="text-amber-500" />,
      bg: 'bg-amber-50',
      titleZh: '选词模式',
      titleEn: 'Multiple Choice',
      descZh: '看中文语境，从选项中选出正确的学术词汇',
      descEn: 'Read the context, pick the right academic word',
      soon: true,
    },
    {
      id: 'shuffle',
      icon: <Shuffle size={22} className="text-indigo-500" />,
      bg: 'bg-indigo-50',
      titleZh: '随机复习',
      titleEn: 'Shuffle Review',
      descZh: '随机抽取词库中的卡片进行快速复习',
      descEn: 'Random flashcards from your vault for quick review',
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
            ? `${totalItems} cards in your vault — practice modes coming soon`
            : `词库中已有 ${totalItems} 张卡片，练习模式即将上线`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map(mode => (
          <div
            key={mode.id}
            className="relative bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3 opacity-75 cursor-not-allowed"
          >
            {/* 即将上线徽章 */}
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
