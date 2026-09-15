import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Priority: saved UI language > user's preferred language > English
    const stored = localStorage.getItem('language')
    if (stored) return stored
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.preferredLanguage || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (code) => {
    setLanguageState(code)
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