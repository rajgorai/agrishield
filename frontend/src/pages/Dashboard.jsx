import React from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-700 font-heading">AgriShield</h1>
          <button onClick={handleLogout} className="btn-outline py-2 px-4 text-sm">
            Logout
          </button>
        </div>
        <div className="card text-center">
          <h2 className="text-xl font-semibold">Welcome, {user.name || 'Farmer'}! 👋</h2>
          <p className="text-gray-600 mt-2">Dashboard coming soon.</p>
          <p className="text-sm text-gray-400 mt-4">Phone: {user.phone}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard