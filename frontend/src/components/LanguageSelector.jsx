import React, { useState, useRef, useEffect } from 'react'

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
]

const LanguageSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const current = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (code) => {
    onChange(code)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg
                   bg-white dark:bg-surface-dark-card
                   border border-border dark:border-border-dark
                   text-text-primary dark:text-text-dark-primary
                   hover:border-brand-mid dark:hover:border-brand-light
                   transition-colors duration-150
                   text-sm font-medium min-w-[100px]"
        aria-label="Select language"
      >
        <svg className="w-4 h-4 text-text-muted dark:text-text-dark-muted"
             fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="flex-1 text-left">{current.native}</span>
        <svg className={`w-3.5 h-3.5 text-text-muted dark:text-text-dark-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
             fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-full min-w-[140px] z-50
                        bg-white dark:bg-surface-dark-card
                        border border-border dark:border-border-dark
                        rounded-lg shadow-deep overflow-hidden animate-fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm
                         transition-colors duration-100
                         ${lang.code === value
                           ? 'bg-brand-pale dark:bg-brand-dark text-brand-mid dark:text-brand-light font-semibold'
                           : 'text-text-secondary dark:text-text-dark-secondary hover:bg-gray-50 dark:hover:bg-surface-dark-elevated'
                         }`}
            >
              <span>{lang.native}</span>
              {lang.code === value && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector