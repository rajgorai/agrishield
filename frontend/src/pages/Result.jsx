import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTranslation from '../hooks/useTranslation'
import ThemeToggle from '../components/ThemeToggle'

const Result = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const diagnosis = location.state?.diagnosis

  const [activeTab, setActiveTab] = useState('original')
  const [isPlaying, setIsPlaying] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const audioRef = useRef(null)

  // Detect low-confidence response (has `message` instead of `diseaseName`)
  const isLowConfidence = diagnosis && !diagnosis.diseaseName && diagnosis.message

  // Handle missing data
  if (!diagnosis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4
                      bg-surface-page dark:bg-surface-dark-page">
        <div className="card text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30
                          flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor"
                 strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-text-muted dark:text-text-dark-muted mb-4">
            {t.resultNoData}
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            {t.resultBack}
          </button>
        </div>
      </div>
    )
  }

  // Low-confidence view
  if (isLowConfidence) {
    return (
      <div className="min-h-screen bg-surface-page dark:bg-surface-dark-page">
        <header className="bg-white dark:bg-surface-dark-card border-b border-border dark:border-border-dark sticky top-0 z-30">
          <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm font-medium
                         text-text-secondary dark:text-text-dark-secondary
                         hover:text-brand-mid transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.resultBack}
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12">
          <div className="card text-center animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30
                            flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-600 dark:text-amber-400"
                   fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
              {t.resultLowConfidenceTitle}
            </h1>
            <p className="text-text-muted dark:text-text-dark-muted mb-1">
              {t.resultLowConfidenceBody}
            </p>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-6">
              {t.resultConfidence}: {(diagnosis.confidence * 100).toFixed(1)}%
            </p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
              {t.resultTryAgain}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ===== Main Result View =====
  const confidencePct = (diagnosis.confidence * 100).toFixed(1)
  const severity = (diagnosis.severity || 'MEDIUM').toUpperCase()
  const hasHeatmap = !!diagnosis.heatmapUrl
  const hasAudio = !!diagnosis.audioUrl

  const severityLabel =
    severity === 'HIGH' ? t.resultSeverityHigh :
    severity === 'LOW' ? t.resultSeverityLow :
    t.resultSeverityMedium

  const severityClass =
    severity === 'HIGH' ? 'badge-high' :
    severity === 'LOW' ? 'badge-low' :
    'badge-medium'

  const confidenceColor =
    diagnosis.confidence >= 0.85 ? 'bg-severity-low' :
    diagnosis.confidence >= 0.60 ? 'bg-severity-medium' :
    'bg-severity-high'

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
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
              aria-label={t.resultBack}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-dark-primary">
              {t.resultTitle}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">

          {/* ===== LEFT COLUMN – Image ===== */}
          <div className="space-y-4">
            <div className="card p-0 overflow-hidden">
              {/* Tabs (only if heatmap exists) */}
              {hasHeatmap && (
                <div className="flex border-b border-border dark:border-border-dark">
                  <button
                    onClick={() => setActiveTab('original')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'original'
                        ? 'text-brand-mid dark:text-brand-light border-b-2 border-brand-mid dark:border-brand-light'
                        : 'text-text-muted dark:text-text-dark-muted'
                    }`}
                  >
                    {t.resultOriginal}
                  </button>
                  <button
                    onClick={() => setActiveTab('heatmap')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      activeTab === 'heatmap'
                        ? 'text-brand-mid dark:text-brand-light border-b-2 border-brand-mid dark:border-brand-light'
                        : 'text-text-muted dark:text-text-dark-muted'
                    }`}
                  >
                    {t.resultHeatmap}
                  </button>
                </div>
              )}

              {/* Image display */}
              <div className="relative bg-gray-100 dark:bg-surface-dark-elevated
                              aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={activeTab === 'heatmap' && hasHeatmap ? diagnosis.heatmapUrl : diagnosis.imageUrl}
                  alt={activeTab === 'heatmap' ? 'Heatmap' : 'Original leaf'}
                  className="w-full h-full object-contain animate-fade-in"
                  key={activeTab}
                />
              </div>

              {/* Heatmap legend (only when viewing heatmap) */}
              {activeTab === 'heatmap' && hasHeatmap && (
                <div className="px-4 py-3 border-t border-border dark:border-border-dark">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted dark:text-text-dark-muted whitespace-nowrap">
                      {t.resultHeatmapLegendLow}
                    </span>
                    <div className="flex-1 h-2 rounded-full
                                    bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500"></div>
                    <span className="text-xs text-text-muted dark:text-text-dark-muted whitespace-nowrap">
                      {t.resultHeatmapLegendHigh}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted dark:text-text-dark-muted mt-2 text-center">
                    {t.resultHeatmapCaption}
                  </p>
                </div>
              )}
            </div>

            {/* Model used badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-text-muted dark:text-text-dark-muted">
              <span>{t.resultModelUsed}:</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${
                diagnosis.modelUsed === 'R'
                  ? 'bg-brand-pale dark:bg-brand-dark text-brand-mid dark:text-brand-light'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              }`}>
                {diagnosis.modelUsed === 'R' ? 'R · Classic' : 'J · Jumbo'}
              </span>
            </div>

            {/* No heatmap note */}
            {!hasHeatmap && diagnosis.modelUsed === 'J' && (
              <div className="text-xs text-center text-text-muted dark:text-text-dark-muted
                              p-3 rounded-lg bg-brand-pale dark:bg-surface-dark-elevated">
                {t.resultNoHeatmap}
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN – Diagnosis ===== */}
          <div className="space-y-5">

            {/* Disease name + crop */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-sm text-text-muted dark:text-text-dark-muted mb-1">
                    {diagnosis.cropName}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-dark-primary">
                    {diagnosis.diseaseName}
                  </h2>
                </div>
                <span className={`${severityClass} ${severity === 'HIGH' ? 'animate-pulse-badge' : ''} shrink-0`}>
                  {severity === 'HIGH' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2l8 14H2L10 2z" />
                    </svg>
                  )}
                  {severity === 'MEDIUM' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                  )}
                  {severity === 'LOW' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                  {severityLabel}
                </span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="card-flat">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                  {t.resultConfidence}
                </span>
                <span className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
                  {confidencePct}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-surface-dark-elevated overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${confidenceColor}`}
                  style={{ width: `${confidencePct}%` }}
                ></div>
              </div>
            </div>

            {/* Treatment advisory */}
            <div className="rounded-xl overflow-hidden
                            border-l-4 border-brand-mid
                            bg-brand-pale dark:bg-brand-dark/30
                            p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-brand-mid dark:text-brand-light"
                     fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 3h6v5l4.5 8.5a2 2 0 0 1-1.75 3h-11.5a2 2 0 0 1-1.75-3L9 8z" strokeLinejoin="round" />
                  <path d="M9 3h6" strokeLinecap="round" />
                </svg>
                <h3 className="text-sm font-bold uppercase tracking-wide
                               text-brand-mid dark:text-brand-light">
                  {t.resultTreatment}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary dark:text-text-dark-secondary">
                {diagnosis.treatment}
              </p>
            </div>

            {/* Audio player */}
            {hasAudio && (
              <button
                onClick={toggleAudio}
                className={`w-full flex items-center justify-center gap-3
                           px-5 py-4 rounded-xl font-semibold text-white
                           transition-all duration-200
                           ${isPlaying
                             ? 'bg-amber-dark shadow-medium'
                             : 'bg-amber hover:bg-amber-dark shadow-soft hover:shadow-medium'
                           }`}
              >
                <audio
                  ref={audioRef}
                  src={diagnosis.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                  className="hidden"
                />
                {isPlaying ? (
                  <>
                    {/* Animated waveform */}
                    <span className="flex items-end gap-0.5 h-5">
                      <span className="w-1 bg-white rounded-full animate-waveform" style={{ animationDelay: '0ms', height: '60%' }}></span>
                      <span className="w-1 bg-white rounded-full animate-waveform" style={{ animationDelay: '150ms', height: '100%' }}></span>
                      <span className="w-1 bg-white rounded-full animate-waveform" style={{ animationDelay: '300ms', height: '70%' }}></span>
                      <span className="w-1 bg-white rounded-full animate-waveform" style={{ animationDelay: '150ms', height: '90%' }}></span>
                      <span className="w-1 bg-white rounded-full animate-waveform" style={{ animationDelay: '0ms', height: '50%' }}></span>
                    </span>
                    {t.resultPlaying}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                    {t.resultListen}
                  </>
                )}
              </button>
            )}

            {/* Top 3 predictions */}
            {diagnosis.top3 && diagnosis.top3.length > 1 && (
              <div className="card-flat">
                <h3 className="text-xs font-bold uppercase tracking-wide mb-3
                               text-text-muted dark:text-text-dark-muted">
                  {t.resultOtherPossibilities}
                </h3>
                <div className="space-y-2">
                  {diagnosis.top3.slice(1).map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-text-secondary dark:text-text-dark-secondary truncate">
                        {p.label.replace(/___/g, ' · ').replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-text-muted dark:text-text-dark-muted shrink-0">
                        {(p.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary flex-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
                {t.resultDiagnoseAnother}
              </button>
              <button
                onClick={() => {
                  setShowToast(true)
                  setTimeout(() => setShowToast(false), 3000)
                }}
                className="btn-outline flex-1 sm:flex-initial"
              >
                {t.resultSaveToHistory}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===== TOAST ===== */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg
                          bg-brand-mid text-white shadow-deep">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium">{t.resultSaved}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Result