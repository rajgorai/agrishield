import React from 'react'
import useTheme from '../hooks/useTheme'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`}>
      {/* ===== Toggle Button ===== */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   bg-gray-50 dark:bg-surface-dark-elevated
                   border-2 border-gray-300 dark:border-gray-600
                   text-gray-600 dark:text-gray-300
                   shadow-sm
                   hover:border-brand-mid hover:text-brand-mid
                   dark:hover:border-brand-light dark:hover:text-brand-light
                   transition-colors duration-150
                   focus:outline-none focus:ring-2 focus:ring-brand-light/40"
      >
        {isDark ? (
          // Sun icon (shown in dark mode)
          <svg className="w-4 h-4" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // Moon icon (shown in light mode)
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* ===== Current mode label (bottom only) ===== */}
      <span className="text-[10px] font-normal tracking-wide
                       text-gray-500 dark:text-gray-400">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  )
}

export default ThemeToggle