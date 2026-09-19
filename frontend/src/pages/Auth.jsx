import { setUser } from '../utils/storage'
import React, { useState } from 'react'
import axios from 'axios'
import ThemeToggle from '../components/ThemeToggle'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const base = import.meta.env.VITE_API_BASE
    const url = isLogin
      ? `${base}/api/auth/login`
      : `${base}/api/auth/register`

    const payload = isLogin
      ? { phone: formData.phone, password: formData.password }
      : {
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          language: formData.language,
        }

    try {
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (isLogin) {
        localStorage.setItem('token', res.data.token)

        const preferredLang = res.data.preferredLanguage || 'en'

      setUser({
        phone: res.data.phone,
        name: res.data.name,
        preferredLanguage: preferredLang,
      })
    
      // UI language- so LanguageContext picks it up immediately 😀
      localStorage.setItem('language', preferredLang)
    
      window.location.href = '/dashboard'
      } else {
        alert('Registration successful! Please login.')
        setIsLogin(true)
        setFormData({ ...formData, password: '' })
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-page dark:bg-surface-dark-page">

      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">

        <div className="text-center mb-6 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="w-11 h-11 rounded-xl bg-brand-mid flex items-center justify-center shadow-soft">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8 2 4 5 4 10c0 5 4 10 8 12 4-2 8-7 8-12 0-5-4-8-8-8zm0 4c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold font-sans tracking-tight">
              <span className="text-brand-dark dark:text-brand-light">Agri</span>
              <span className="text-brand-mid dark:text-white">Shield</span>
            </h1>
          </div>
          <p className="text-sm text-text-muted dark:text-text-dark-muted">
            Diagnose crop diseases.
          </p>
        </div>

        <div className="w-full max-w-md card animate-fade-in-up">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-text-muted dark:text-text-dark-muted">
              {isLogin
                ? 'Sign in to your AgriShield account.'
                : 'Get started with AgriShield for free.'}
            </p>
          </div>

          <div className="toggle-container mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError('') }}
              className={`toggle-button ${isLogin ? 'toggle-active' : 'toggle-inactive'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError('') }}
              className={`toggle-button ${!isLogin ? 'toggle-active' : 'toggle-inactive'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl border border-red-200 dark:border-red-800
                            bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300
                            flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. Ravi Farmer"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
                Phone Number
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">+91</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-text-primary dark:text-text-dark-primary placeholder:text-text-muted dark:placeholder:text-text-dark-muted"
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-text-muted hover:text-brand-mid
                             dark:text-text-dark-muted dark:hover:text-brand-light
                             transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
                  Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'bn', label: 'বাংলা' },
                    { code: 'hi', label: 'हिन्दी' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setFormData({ ...formData, language: l.code })}
                      className={`py-2.5 rounded-lg border-2 text-sm font-semibold
                                 transition-all duration-200
                                 ${
                                   formData.language === l.code
                                     ? 'border-brand-mid bg-brand-pale text-brand-mid dark:bg-brand-dark dark:text-brand-light dark:border-brand-light'
                                     : 'border-border dark:border-border-dark text-text-muted dark:text-text-dark-muted hover:border-brand-light'
                                 }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border text-brand-mid focus:ring-brand-light"
                  />
                  <span className="text-text-muted dark:text-text-dark-muted">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset coming soon.')}
                  className="text-brand-mid dark:text-brand-light font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="spinner-green"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted dark:text-text-dark-muted mt-5">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ ...formData, password: '' }) }}
              className="text-brand-mid dark:text-brand-light font-semibold hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth