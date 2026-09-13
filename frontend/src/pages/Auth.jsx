import React, { useState } from 'react'
import axios from 'axios'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    language: 'en'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = isLogin
      ? 'http://localhost:8080/api/auth/login'
      : 'http://localhost:8080/api/auth/register'

    const payload = isLogin
      ? { phone: formData.phone, password: formData.password }
      : { name: formData.name, phone: formData.phone, password: formData.password }

    try {
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (isLogin) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify({
          phone: res.data.phone,
          name: res.data.name
        }))
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-700 font-heading">AgriShield</h1>
          <p className="text-gray-600 text-sm mt-1">
            {isLogin ? 'Welcome back! Login to your account.' : 'Create your account to get started.'}
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              isLogin ? 'bg-primary-700 text-white shadow-md' : 'text-gray-600 hover:text-primary-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              !isLogin ? 'bg-primary-700 text-white shadow-md' : 'text-gray-600 hover:text-primary-700'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ ...formData, password: '' }) }}
            className="text-primary-700 font-semibold hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth