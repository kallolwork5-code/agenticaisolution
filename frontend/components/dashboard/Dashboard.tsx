'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthProvider'
import { LogOut, User, BarChart3 } from 'lucide-react'
import CarouselNavigation from './CarouselNavigation'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleSectionChange = (sectionId: string) => {
    // Navigate to the specific page when carousel item is clicked
    switch (sectionId) {
      case 'data-management':
        router.push('/dashboard/data-management')
        break
      case 'dashboard':
        router.push('/dashboard/analytics')
        break
      case 'engine':
        router.push('/dashboard/ai-engine')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  CollectiSense AI
                </h1>
                <p className="text-xs text-gray-600">Financial Transaction Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.username}</p>
                  <p className="text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Only Carousel */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to CollectiSense AI
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a section below to get started with intelligent financial transaction management
          </p>
        </div>
        
        {/* Carousel Navigation - Landing Page */}
        <CarouselNavigation 
          activeSection="data-management" // Default selection
          onSectionChange={handleSectionChange}
        />
      </main>
    </div>
  )
}