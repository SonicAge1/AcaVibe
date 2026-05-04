import { createContext, useContext, useState } from 'react'
import { LANGS } from './i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('zh')
  const t = LANGS[lang]
  const toggleLang = () => setLang(l => l === 'zh' ? 'en' : 'zh')
  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
