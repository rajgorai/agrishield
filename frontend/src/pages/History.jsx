import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useTranslation from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../components/ThemeToggle'

const History = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()

  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openingId, setOpeningId] = useState(null)

  const PAGE_SIZE = 10

  const fetchPage = async (pageNum) => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get('http://localhost:8080/api/diagnoses', {
        params: { page: pageNum, size: PAGE_SIZE },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = res.data
      const newItems = data.content || []
      setItems((prev) => (pageNum === 0 ? newItems : [...prev, ...newItems]))
      setHasMore(!data.last)
    } catch (err) {
      setError(err.response?.data?.error || t.historyError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(0)
    setPage(0)
    // eslint-disable-next-line
  }, [])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPage(next)
  }

  const openDiagnosis = async (id) => {
    setOpeningId(id)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`http://localhost:8080/api/diagnoses/${id}`, {
        params: { language },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      navigate('/result', { state: { diagnosis: res.data } })
    } catch (err) {
      setError(err.response?.data?.error || t.historyError)
      setOpeningId(null)
    }
  }

  // Pick disease name by UI language
  const pickDiseaseName = (item) => {
    if (language === 'bn') return item.diseaseNameBn || item.diseaseNameEn
    if (language === 'hi') return item.diseaseNameHi || item.diseaseNameEn
    return item.diseaseNameEn
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const severityClass = (sev) => {
    const s = (sev || '').toUpperCase()
    if (s === 'HIGH') return 'badge-high'
    if (s === 'LOW') return 'badge-low'
    return 'badge-medium'
  }

  return (
    <div className="min-h-screen bg-surface-page dark:bg-surface-dark-page">

      {/* ===== HEADER ===== */}
      <header className="bg-white dark:bg-surface-dark-card border-b border-border dark:border-border-dark sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-1 rounded-lg
                         text-text-muted dark:text-text-dark-muted
                         hover:bg-gray-100 dark:hover:bg-surface-dark-elevated transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-dark-primary">
              {t.historyTitle}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && !error && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl
                            bg-brand-pale dark:bg-surface-dark-elevated
                            flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-mid" fill="none"
                   stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </div>
            <p className="text-text-muted dark:text-text-dark-muted text-sm">
              {t.historyEmpty}
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
              {t.resultBack}
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-3">
          {items.map((item) => {
            const diseaseName = pickDiseaseName(item)
            const isOpening = openingId === item.id

            return (
              <button
                key={item.id}
                onClick={() => openDiagnosis(item.id)}
                disabled={isOpening}
                className="w-full text-left card p-3 sm:p-4
                           hover:shadow-medium transition-shadow
                           flex items-center gap-3 sm:gap-4
                           disabled:opacity-60"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden
                                bg-gray-100 dark:bg-surface-dark-elevated">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={diseaseName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted dark:text-text-dark-muted truncate">
                        {item.cropName}
                      </p>
                      <p className="text-sm sm:text-base font-semibold
                                    text-text-primary dark:text-text-dark-primary truncate">
                        {diseaseName}
                      </p>
                    </div>
                    <span className={`${severityClass(item.severity)} shrink-0`}>
                      {item.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs
                                  text-text-muted dark:text-text-dark-muted">
                    <span>{formatDate(item.createdAt)}</span>
                    {typeof item.confidenceScore === 'number' && (
                      <span className="font-semibold text-brand-mid dark:text-brand-light">
                        {(item.confidenceScore * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Right icon */}
                {isOpening ? (
                  <span className="spinner-green shrink-0"></span>
                ) : (
                  <svg className="w-5 h-5 text-text-muted shrink-0"
                       fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <span className="spinner-green"></span>
            <span className="ml-3 text-sm text-text-muted dark:text-text-dark-muted">
              {t.historyLoading}
            </span>
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && items.length > 0 && (
          <div className="flex justify-center mt-6">
            <button onClick={handleLoadMore} className="btn-outline">
              {t.historyLoadMore}
            </button>
          </div>
        )}

        {/* End */}
        {!loading && !hasMore && items.length > 0 && (
          <p className="text-center text-xs text-text-muted dark:text-text-dark-muted mt-6">
            — {t.historyEnd} —
          </p>
        )}
      </main>
    </div>
  )
}

export default History