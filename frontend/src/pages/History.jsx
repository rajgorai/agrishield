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
  const [selectedIds, setSelectedIds] = useState([])
  const [deleting, setDeleting] = useState(false)

  const PAGE_SIZE = 10
  const token = localStorage.getItem('token')
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchPage = async (pageNum) => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/diagnoses`, {
        params: { page: pageNum, size: PAGE_SIZE },
        headers: authHeader,
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
    setSelectedIds([])
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
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/diagnoses/${id}`, {
        params: { language },
        headers: authHeader,
      })
      navigate('/result', { state: { diagnosis: res.data } })
    } catch (err) {
      setError(err.response?.data?.error || t.historyError)
      setOpeningId(null)
    }
  }

  // ===== Selection =====
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((i) => i.id))
    }
  }

  // ===== Delete single =====
  const deleteOne = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this diagnosis? This cannot be undone.')) return

    setDeleting(true)
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/api/diagnoses/${id}`, {
        headers: authHeader,
      })
      setItems((prev) => prev.filter((i) => i.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  // ===== Delete selected =====
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} selected diagnos${selectedIds.length === 1 ? 'is' : 'es'}? This cannot be undone.`)) return

    setDeleting(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/diagnoses/bulk-delete`,
        { ids: selectedIds },
        { headers: authHeader }
      )
      setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)))
      setSelectedIds([])
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk delete failed')
    } finally {
      setDeleting(false)
    }
  }

  // ===== Delete all =====
  const deleteAll = async () => {
    if (!window.confirm('Delete ALL your diagnosis history? This cannot be undone.')) return
    if (!window.confirm('Are you absolutely sure? This removes every past diagnosis.')) return

    setDeleting(true)
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/api/diagnoses`, {
        headers: authHeader,
      })
      setItems([])
      setSelectedIds([])
      setHasMore(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Delete all failed')
    } finally {
      setDeleting(false)
    }
  }

  // ===== Language helpers =====
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

  const allSelected = items.length > 0 && selectedIds.length === items.length

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

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={deleteAll}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                           text-red-600 dark:text-red-400 text-sm font-semibold
                           hover:bg-red-50 dark:hover:bg-red-900/20
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
                title="Delete all history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Delete All</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Select-all row */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 text-sm font-medium
                         text-text-secondary dark:text-text-dark-secondary
                         hover:text-brand-mid dark:hover:text-brand-light transition-colors"
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center
                              ${allSelected
                                ? 'bg-brand-mid border-brand-mid'
                                : 'border-border dark:border-border-dark'
                              }`}>
                {allSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor"
                       strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-xs text-text-muted dark:text-text-dark-muted">
              {items.length} diagnos{items.length === 1 ? 'is' : 'es'}
            </span>
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
            const isSelected = selectedIds.includes(item.id)

            return (
              <div
                key={item.id}
                className={`card p-3 sm:p-4 flex items-center gap-3 sm:gap-4
                           transition-all
                           ${isSelected
                             ? 'ring-2 ring-brand-mid border-brand-mid'
                             : 'hover:shadow-medium'
                           }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
                  className="shrink-0 p-1"
                  aria-label="Select"
                >
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                  transition-colors
                                  ${isSelected
                                    ? 'bg-brand-mid border-brand-mid'
                                    : 'border-border dark:border-border-dark hover:border-brand-mid'
                                  }`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor"
                           strokeWidth="3" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>

                {/* Clickable body → opens diagnosis */}
                <button
                  type="button"
                  onClick={() => openDiagnosis(item.id)}
                  disabled={isOpening || deleting}
                  className="flex-1 flex items-center gap-3 sm:gap-4 text-left min-w-0
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

                  {isOpening && (
                    <span className="spinner-green shrink-0"></span>
                  )}
                </button>

                {/* Trash icon — always visible on mobile, hover on desktop */}
                <button
                  type="button"
                  onClick={(e) => deleteOne(item.id, e)}
                  disabled={deleting}
                  className="shrink-0 p-2 rounded-lg
                             text-text-muted dark:text-text-dark-muted
                             sm:opacity-0 sm:group-hover:opacity-100
                             hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-all
                             disabled:opacity-40"
                  aria-label="Delete"
                  title="Delete this diagnosis"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
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

      {/* ===== BULK ACTION BAR ===== */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40
                        bg-white dark:bg-surface-dark-card
                        border-t border-border dark:border-border-dark
                        shadow-deep
                        animate-fade-in-up">
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-3
                          flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold
                           text-text-secondary dark:text-text-dark-secondary
                           hover:bg-gray-100 dark:hover:bg-surface-dark-elevated
                           transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                           bg-red-600 hover:bg-red-700 text-white text-sm font-semibold
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default History