import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useTranslation from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../components/ThemeToggle'
import CameraCapture from '../components/CameraCapture'

const Chat = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [imageAttachment, setImageAttachment] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const imageInputRef = useRef(null)
  const baseInputRef = useRef('') // What was typed before voice started

  // Greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: t.chatWelcome,
        timestamp: new Date(),
      },
    ])
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Web Speech API support check
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true // show live updates but handle carefully

      // Rebuild full transcript from ALL results each fire
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        const base = baseInputRef.current
        setInput(base ? base + ' ' + transcript : transcript)
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => {
        setIsListening(false)
        // Trim any extra whitespace
        setInput((prev) => prev.trim())
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Update recognition language when UI language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const langMap = { en: 'en-IN', bn: 'bn-IN', hi: 'hi-IN' }
      recognitionRef.current.lang = langMap[language] || 'en-IN'
    }
  }, [language])

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert(t.chatVoiceUnsupported)
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        // Save current input as the base for the session
        baseInputRef.current = input.trim()
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        setIsListening(false)
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setImageAttachment(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleCapturedImage = (file) => {
    setImageAttachment(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageAttachment(null)
    setImagePreview(null)
  }

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed && !imageAttachment) return

    const imageToSend = imageAttachment
    const previewToShow = imagePreview

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      image: previewToShow,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setImageAttachment(null)
    setImagePreview(null)
    setSending(true)

    const token = localStorage.getItem('token')

    try {
      let answer

      if (imageToSend) {
        const formData = new FormData()
        formData.append('image', imageToSend)
        formData.append('question', trimmed || '')

        const res = await axios.post(
          'http://localhost:8080/api/chat/ask-with-image',
          formData,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        answer = res.data.answer
      } else {
        const res = await axios.get('http://localhost:8080/api/chat/ask', {
          params: { question: trimmed },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        answer = typeof res.data === 'string' ? res.data : res.data.answer
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: answer || t.chatError,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          text: err.response?.data?.error || t.chatError,
          timestamp: new Date(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClear = () => {
    if (window.confirm(t.chatClearConfirm)) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          text: t.chatWelcome,
          timestamp: new Date(),
        },
      ])
    }
  }

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [input])

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const suggestions = [
    t.chatSuggestion1,
    t.chatSuggestion2,
    t.chatSuggestion3,
    t.chatSuggestion4,
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface-page dark:bg-surface-dark-page">

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
            <div>
              <h1 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-dark-primary">
                {t.chatTitle}
              </h1>
              <p className="text-xs text-text-muted dark:text-text-dark-muted hidden sm:block">
                {t.chatSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20
                         transition-colors"
              aria-label={t.chatClear}
              title={t.chatClear}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ===== MESSAGES ===== */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-soft
                            ${
                              msg.role === 'user'
                                ? 'bg-brand-mid text-white rounded-br-sm'
                                : 'bg-white dark:bg-surface-dark-card text-text-primary dark:text-text-dark-primary border border-border dark:border-border-dark rounded-bl-sm'
                            }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="max-h-48 rounded-lg mb-2"
                  />
                )}
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === 'user'
                      ? 'text-white/70'
                      : 'text-text-muted dark:text-text-dark-muted'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-surface-dark-card border border-border dark:border-border-dark
                              rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-mid animate-bounce"
                        style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-brand-mid animate-bounce"
                        style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-brand-mid animate-bounce"
                        style={{ animationDelay: '300ms' }}></span>
                  <span className="text-xs text-text-muted dark:text-text-dark-muted ml-2">
                    {t.chatThinking}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions (empty state) */}
          {messages.length === 1 && !sending && (
            <div className="pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider
                            text-text-muted dark:text-text-dark-muted mb-3">
                {t.chatSuggestedTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-2 rounded-full text-xs sm:text-sm
                               bg-white dark:bg-surface-dark-card
                               border border-border dark:border-border-dark
                               text-text-secondary dark:text-text-dark-secondary
                               hover:border-brand-mid hover:text-brand-mid
                               dark:hover:border-brand-light dark:hover:text-brand-light
                               transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ===== INPUT BAR ===== */}
      <footer className="bg-white dark:bg-surface-dark-card border-t border-border dark:border-border-dark sticky bottom-0">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-3">

          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img src={imagePreview} alt="attachment"
                   className="h-20 rounded-lg border border-border dark:border-border-dark" />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                           bg-red-600 text-white shadow-md
                           flex items-center justify-center text-xs font-bold"
              >
                ×
              </button>
            </div>
          )}

          {isListening && (
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-brand-mid dark:text-brand-light">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {t.chatListening}...
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light transition-colors"
              title="Attach image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="p-2.5 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light transition-colors"
              title="Take photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9a2 2 0 0 1 2-2h1.5l1-2h9l1 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chatPlaceholder}
              rows={1}
              style={{ resize: 'none', overflow: 'hidden' }}
              className="flex-1 rounded-2xl px-4 py-3 text-sm
                         bg-gray-50 dark:bg-surface-dark-elevated
                         text-text-primary dark:text-text-dark-primary
                         placeholder:text-text-muted dark:placeholder:text-text-dark-muted
                         border border-border dark:border-border-dark
                         focus:outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-light/20
                         transition-all duration-200
                         max-h-[140px] overflow-hidden"
            />

            <button
              type="button"
              onClick={toggleVoice}
              disabled={!voiceSupported}
              title={voiceSupported ? t.chatVoiceStart : t.chatVoiceUnsupported}
              className={`p-2.5 rounded-lg transition-colors
                         ${
                           isListening
                             ? 'bg-red-600 text-white shadow-md animate-pulse'
                             : voiceSupported
                             ? 'text-text-muted dark:text-text-dark-muted hover:bg-brand-pale dark:hover:bg-surface-dark-elevated hover:text-brand-mid dark:hover:text-brand-light'
                             : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                         }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={(!input.trim() && !imageAttachment) || sending}
              className="p-3 rounded-full bg-brand-mid text-white
                         hover:bg-brand-light hover:scale-105
                         active:scale-100
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-150 shadow-soft"
              title={t.chatSend}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      {cameraOpen && (
        <CameraCapture
          onCapture={handleCapturedImage}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  )
}

export default Chat