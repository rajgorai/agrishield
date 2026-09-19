import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUser } from '../utils/storage'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Priority: saved UI language > user's preferred language > English
    const stored = localStorage.getItem('language')
    if (stored === 'en' || stored === 'bn' || stored === 'hi') return stored

    const user = getUser() // Safe parse — returns {} if corrupted
    const preferred = user.preferredLanguage
    if (preferred === 'en' || preferred === 'bn' || preferred === 'hi') {
      return preferred
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (code) => {
    if (code === 'en' || code === 'bn' || code === 'hi') {
      setLanguageState(code)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}