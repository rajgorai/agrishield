import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ThemeToggle from '../components/ThemeToggle'
import LanguageSelector from '../components/LanguageSelector'
import useTranslation from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [model, setModel] = useState('R')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [selectedFile])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('language')
    window.location.href = '/'
  }

  const handleLanguageChange = (code) => {
    setLanguage(code)
    const updatedUser = { ...user, preferredLanguage: code }
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const validateAndSetFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError(t.errorImage)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t.errorSize)
      return
    }
    setError('')
    setSelectedFile(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) validateAndSetFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  const handleDragOver = (e) => e.preventDefault()
  const triggerFileInput = () => fileInputRef.current.click()

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t.errorNoFile)
      return
    }
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('language', language)
    formData.append('model', model)

    const token = localStorage.getItem('token')

    try {
      const res = await axios.post('http://localhost:8080/api/diagnose', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      navigate('/result', { state: { diagnosis: res.data } })
    } catch (err) {
      setError(err.response?.data?.error || t.errorDiagnosis)
    } finally {
      setUploading(false)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t.greetingMorning
    if (hour < 17) return t.greetingAfternoon
    return t.greetingEvening
  }

  return (
    <div className="min-h-screen bg-surface-page dark:bg-surface-dark-page">

      {/* ===================== TOP BAR ===================== */}
      <header className="bg-white dark:bg-surface-dark-card border-b border-border dark:border-border-dark sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg
                         text-text-secondary dark:text-text-dark-secondary
                         hover:bg-gray-100 dark:hover:bg-surface-dark-elevated
                         transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>

            {/* R/J toggle (desktop) */}
            <div className="hidden md:inline-flex items-center p-1 rounded-full
                            bg-brand-pale dark:bg-surface-dark-elevated
                            shadow-md dark:shadow-none
                            border border-brand-light/30 dark:border-transparent">
              <button
                type="button"
                onClick={() => setModel('R')}
                title="Classic – 38 classes with Grad-CAM"
                className={`px-4 py-1.5 rounded-full text-xs font-bold
                           transition-all duration-200 ${
                  model === 'R'
                    ? 'bg-brand-mid text-white shadow-md'
                    : 'text-text-muted dark:text-text-dark-muted hover:text-brand-mid dark:hover:text-brand-light'
                }`}
              >
                R
              </button>
              <button
                type="button"
                onClick={() => setModel('J')}
                title="Jumbo – 88 classes"
                className={`px-4 py-1.5 rounded-full text-xs font-bold
                           transition-all duration-200 ${
                  model === 'J'
                    ? 'bg-brand-mid text-white shadow-md'
                    : 'text-text-muted dark:text-text-dark-muted hover:text-brand-mid dark:hover:text-brand-light'
                }`}
              >
                J
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-mid flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 4 5 4 10c0 5 4 10 8 12 4-2 8-7 8-12 0-5-4-8-8-8zm0 4c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">
                <span className="text-brand-dark dark:text-brand-light">Agri</span>
                <span className="text-brand-mid dark:text-white">Shield</span>
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Chat */}
            <button
              onClick={() => navigate('/chat')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary dark:text-text-dark-secondary
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light
                         transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat
            </button>

            {/* History */}
            <button
              onClick={() => navigate('/history')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-text-secondary dark:text-text-dark-secondary
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light
                         transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              History
            </button>

            <div className="hidden md:block">
              <LanguageSelector value={language} onChange={handleLanguageChange} />
            </div>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                         bg-red-600 hover:bg-red-700 text-white text-sm font-semibold
                         transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE DRAWER ===================== */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-72 z-50 md:hidden
                            bg-white dark:bg-surface-dark-card
                            border-r border-border dark:border-border-dark
                            shadow-deep animate-slide-in-left
                            flex flex-col">
            <div className="flex items-center justify-between p-4
                            border-b border-border dark:border-border-dark">
              <span className="font-bold text-text-primary dark:text-text-dark-primary">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100
                           dark:hover:bg-surface-dark-elevated transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 pb-4 border-b border-border dark:border-border-dark">
                <p className="text-sm text-text-muted dark:text-text-dark-muted">Signed in as</p>
                <p className="font-semibold text-text-primary dark:text-text-dark-primary mt-0.5">
                  {user.name || 'Farmer'}
                </p>
                <p className="text-xs text-text-muted dark:text-text-dark-muted">{user.phone}</p>
              </div>

              <nav className="py-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left
                             text-text-primary dark:text-text-dark-primary
                             hover:bg-brand-pale dark:hover:bg-surface-dark-elevated transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/chat') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left
                             text-text-primary dark:text-text-dark-primary
                             hover:bg-brand-pale dark:hover:bg-surface-dark-elevated transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat with AI
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/history') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left
                             text-text-primary dark:text-text-dark-primary
                             hover:bg-brand-pale dark:hover:bg-surface-dark-elevated transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  History
                </button>
              </nav>

              <div className="px-4 py-3 border-t border-border dark:border-border-dark">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-text-dark-muted mb-2">
                  Model
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModel('R')}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      model === 'R' ? 'bg-brand-mid text-white shadow-md' : 'bg-gray-100 dark:bg-surface-dark-elevated text-text-muted'
                    }`}
                  >
                    R
                  </button>
                  <button
                    onClick={() => setModel('J')}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      model === 'J' ? 'bg-brand-mid text-white shadow-md' : 'bg-gray-100 dark:bg-surface-dark-elevated text-text-muted'
                    }`}
                  >
                    J
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-border dark:border-border-dark">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-text-dark-muted mb-2">
                  Language
                </p>
                <div className="space-y-1">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'bn', label: 'বাংলা' },
                    { code: 'hi', label: 'हिन्दी' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        language === l.code
                          ? 'bg-brand-pale dark:bg-brand-dark text-brand-mid dark:text-brand-light font-semibold'
                          : 'text-text-secondary dark:text-text-dark-secondary hover:bg-gray-50 dark:hover:bg-surface-dark-elevated'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.code && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border dark:border-border-dark">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2
                           py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white
                           font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===================== MAIN ===================== */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
            {greeting()}, {user.name || 'Farmer'}
          </h2>
          <p className="text-text-muted dark:text-text-dark-muted mt-1">
            {t.uploadSubtitle}
          </p>
        </div>

        <div className="card animate-fade-in-up">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {t.diagnoseHeading}
            </h3>
            <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
              {t.diagnoseSubheading}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20
                            border border-red-200 dark:border-red-800
                            text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileInput}
            className="cursor-pointer rounded-2xl border-2 border-dashed
                       border-brand-light/60 hover:border-brand-mid
                       bg-brand-pale/40 dark:bg-brand-dark/20
                       hover:bg-brand-pale dark:hover:bg-brand-dark/40
                       transition-colors duration-200
                       p-8 text-center"
          >
            {preview ? (
              <div>
                <img src={preview} alt="Preview"
                     className="max-h-56 mx-auto rounded-lg shadow-soft mb-3" />
                <p className="text-sm text-text-muted dark:text-text-dark-muted">
                  {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                  className="mt-3 text-sm text-red-600 hover:underline font-medium"
                >
                  {t.removePhoto}
                </button>
              </div>
            ) : (
              <div className="py-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-brand-mid/10
                                flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-mid" fill="none" stroke="currentColor"
                       strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                </div>
                <p className="text-base font-medium text-text-primary dark:text-text-dark-primary">
                  {t.tapToChoose}
                </p>
                <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1">
                  {t.dragDrop}
                </p>
                <p className="text-xs text-text-muted dark:text-text-dark-muted mt-2">
                  {t.fileFormats}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary w-full mt-6"
          >
            {uploading ? (
              <>
                <span className="spinner-green"></span>
                {t.analysing}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                {t.diagnoseButton}
              </>
            )}
          </button>
        </div>

        {/* View Past Diagnoses card */}
        <button
          onClick={() => navigate('/history')}
          className="mt-4 w-full card flex items-center justify-between
                     hover:shadow-medium transition-shadow text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-pale dark:bg-surface-dark-elevated
                            flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-mid dark:text-brand-light"
                   fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary dark:text-text-dark-primary">
                {t.historyTitle}
              </p>
              <p className="text-xs text-text-muted dark:text-text-dark-muted mt-0.5">
                {t.historyEmpty.split('.')[0]}
              </p>
            </div>
          </div>
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mt-6 p-4 rounded-xl bg-brand-pale dark:bg-surface-dark-elevated
                        border border-brand-light/40 dark:border-border-dark">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            <span className="font-semibold">{t.tipLabel}</span> {t.tipBody}
          </p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard