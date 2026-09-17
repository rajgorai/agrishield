import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useTranslation from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import ThemeToggle from '../components/ThemeToggle'
import CameraCapture from '../components/CameraCapture'

const STORAGE_KEY = 'agrishield_chats'

const Chat = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { language } = useLanguage()

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [showChatsPanel, setShowChatsPanel] = useState(false)
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
  const baseInputRef = useRef('')
  const hasLoadedRef = useRef(false)

  // Derived current messages
  const activeConversation = conversations.find((c) => c.id === activeId)
  const messages = activeConversation?.messages || []

  const makeWelcome = (id) => ({
    id: 'welcome-' + id,
    role: 'assistant',
    text: t.chatWelcome,
    timestamp: new Date(),
  })

  const hasRealContent = (conv) =>
    conv.messages.some(
      (m) => !m.id.startsWith('welcome')
    )

  // ===== Load from storage on mount =====
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const restored = parsed.map((c) => ({
            ...c,
            messages: c.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          }))
          setConversations(restored)
          setActiveId(restored[0].id)
          hasLoadedRef.current = true
          return
        }
      } catch (e) {
        console.error('Failed to restore chats:', e)
      }
    }
    // No saved chats → create first
    const id = Date.now().toString()
    setConversations([
      {
        id,
        title: 'New chat',
        createdAt: new Date().toISOString(),
        messages: [makeWelcome(id)],
      },
    ])
    setActiveId(id)
    hasLoadedRef.current = true
    // eslint-disable-next-line
  }, [])

  // ===== Save to storage whenever conversations change =====
  useEffect(() => {
    if (!hasLoadedRef.current) return
    if (conversations.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    }
  }, [conversations])

  // ===== Auto-scroll =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // ===== Web Speech API =====
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true

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
        setInput((prev) => prev.trim())
      }

      recognitionRef.current = recognition
    }
  }, [])

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

  // ===== Update messages in the CURRENT conversation =====
  const updateCurrentMessages = (updater) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        const newMessages =
          typeof updater === 'function' ? updater(c.messages) : updater
        return { ...c, messages: newMessages }
      })
    )
  }

  // ===== New Chat =====
  const createNewChat = () => {
    const id = Date.now().toString()
    const newChat = {
      id,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      messages: [makeWelcome(id)],
    }
    setConversations((prev) => {
      // Drop any empty conversations (only welcome message)
      const filtered = prev.filter((c) => hasRealContent(c))
      return [newChat, ...filtered]
    })
    setActiveId(id)
    setShowChatsPanel(false)
    setInput('')
    setImageAttachment(null)
    setImagePreview(null)
  }

  const switchChat = (id) => {
    setActiveId(id)
    setShowChatsPanel(false)
    setInput('')
    setImageAttachment(null)
    setImagePreview(null)
  }

  const deleteChat = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this conversation?')) return
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id)
      if (remaining.length === 0) {
        const newId = Date.now().toString()
        setActiveId(newId)
        return [
          {
            id: newId,
            title: 'New chat',
            createdAt: new Date().toISOString(),
            messages: [makeWelcome(newId)],
          },
        ]
      }
      if (id === activeId) {
        setActiveId(remaining[0].id)
      }
      return remaining
    })
  }

  const clearCurrentChat = () => {
    if (!window.confirm('Clear messages in this chat?')) return
    updateCurrentMessages([makeWelcome(activeId)])
  }

  // ===== Send Message =====
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed && !imageAttachment) return

    const imageToSend = imageAttachment
    const previewToShow = imagePreview

    const history = messages
      .filter((m) => !m.id.startsWith('welcome'))
      .filter((m) => m.text && m.text.trim() !== '')
      .slice(-10)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        text: m.text,
      }))

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      image: previewToShow,
      timestamp: new Date(),
    }

    // Update title if this is the first user message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        const isFirstUserMsg = !c.messages.some((m) => m.role === 'user')
        return {
          ...c,
          title:
            isFirstUserMsg && trimmed
              ? trimmed.slice(0, 40)
              : c.title,
          messages: [...c.messages, userMessage],
        }
      })
    )

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
          `${import.meta.env.VITE_API_BASE}/api/chat/ask-with-image`,
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
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/chat/ask`,
          { question: trimmed, history },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        )
        answer = res.data.answer
      }

      updateCurrentMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: answer || t.chatError,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      updateCurrentMessages((prev) => [
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

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [input])

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const formatChatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const diffMs = Date.now() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hrs = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  }

  const getPreview = (conv) => {
    const lastMsg = [...conv.messages]
      .reverse()
      .find((m) => m.role === 'user' && m.text && m.text.trim())
    return lastMsg ? lastMsg.text.slice(0, 60) : 'No messages yet'
  }

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
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-1 rounded-lg shrink-0
                         text-text-muted dark:text-text-dark-muted
                         hover:bg-gray-100 dark:hover:bg-surface-dark-elevated transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-text-primary dark:text-text-dark-primary truncate">
                {activeConversation?.title && activeConversation.title !== 'New chat'
                  ? activeConversation.title
                  : t.chatTitle}
              </h1>
              <p className="text-xs text-text-muted dark:text-text-dark-muted hidden sm:block">
                {t.chatSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* New Chat */}
            <button
              onClick={createNewChat}
              className="p-2 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light
                         transition-colors"
              title="New chat"
              aria-label="New chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" />
              </svg>
            </button>

            {/* All chats */}
            <button
              onClick={() => setShowChatsPanel(true)}
              className="relative p-2 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-brand-pale dark:hover:bg-surface-dark-elevated
                         hover:text-brand-mid dark:hover:text-brand-light
                         transition-colors"
              title="All chats"
              aria-label="All chats"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
              </svg>
              {conversations.filter(hasRealContent).length > 1 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1
                                 rounded-full bg-brand-mid text-white text-[9px]
                                 flex items-center justify-center font-bold">
                  {conversations.filter(hasRealContent).length}
                </span>
              )}
            </button>

            {/* Clear current */}
            <button
              onClick={clearCurrentChat}
              className="p-2 rounded-lg text-text-muted dark:text-text-dark-muted
                         hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20
                         transition-colors"
              aria-label="Clear chat"
              title="Clear current chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ===== CHATS PANEL (slide-in) ===== */}
      {showChatsPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowChatsPanel(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50
                            bg-white dark:bg-surface-dark-card
                            border-r border-border dark:border-border-dark
                            shadow-deep flex flex-col
                            animate-slide-in-left">
            <div className="flex items-center justify-between p-4
                            border-b border-border dark:border-border-dark">
              <h2 className="font-bold text-text-primary dark:text-text-dark-primary">
                Chats
              </h2>
              <button
                onClick={() => setShowChatsPanel(false)}
                className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100
                           dark:hover:bg-surface-dark-elevated transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* New Chat button at top */}
            <div className="p-3 border-b border-border dark:border-border-dark">
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2
                           py-2.5 rounded-lg bg-brand-mid hover:bg-brand-light
                           text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto py-2">
              {conversations.filter(hasRealContent).length === 0 ? (
                <p className="text-center text-sm text-text-muted dark:text-text-dark-muted py-8 px-4">
                  No previous chats yet. Send a message to start one.
                </p>
              ) : (
                conversations
                  .filter(hasRealContent)
                  .map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => switchChat(conv.id)}
                      className={`group mx-2 mb-1 px-3 py-2.5 rounded-lg cursor-pointer
                                 transition-colors relative
                                 ${
                                   conv.id === activeId
                                     ? 'bg-brand-pale dark:bg-brand-dark/40 border border-brand-light/40 dark:border-brand-light/30'
                                     : 'hover:bg-gray-50 dark:hover:bg-surface-dark-elevated border border-transparent'
                                 }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              conv.id === activeId
                                ? 'text-brand-mid dark:text-brand-light'
                                : 'text-text-primary dark:text-text-dark-primary'
                            }`}
                          >
                            {conv.title}
                          </p>
                          <p className="text-xs text-text-muted dark:text-text-dark-muted truncate mt-0.5">
                            {getPreview(conv)}
                          </p>
                          <p className="text-[10px] text-text-muted dark:text-text-dark-muted mt-1">
                            {formatChatDate(conv.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => deleteChat(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 shrink-0
                                     p-1.5 rounded-md
                                     text-text-muted hover:text-red-600
                                     hover:bg-red-50 dark:hover:bg-red-900/30
                                     transition-all"
                          aria-label="Delete chat"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </aside>
        </>
      )}

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