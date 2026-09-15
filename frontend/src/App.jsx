import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Result from './pages/Result'
import Chat from './pages/Chat'
import History from './pages/History'

function App() {
  const token = localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/result" element={token ? <Result /> : <Navigate to="/" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/" />} />
        <Route path="/history" element={token ? <History /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App