'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import LoginPage from '@/components/auth/LoginPage'
import Dashboard from '@/components/dashboard/Dashboard'

export default function Home() {
  const { isAuthenticated, login, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? (
    <Dashboard onLogout={logout} />
  ) : (
    <LoginPage onLogin={login} />
  )
}