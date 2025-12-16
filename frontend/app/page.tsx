'use client'

import { useAuth } from '@/lib/auth/AuthProvider'
import LoginPage from '@/components/auth/LoginPage'
import Dashboard from '@/components/dashboard/Dashboard'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}