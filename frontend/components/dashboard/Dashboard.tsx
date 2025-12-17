'use client'

import React, { useState } from 'react'
import { LogOut, User, Bell, Settings } from 'lucide-react'
import MainCarousel from './MainCarousel'
import PromptRepository from '../pages/PromptRepository'
import DataManagement from '../pages/DataManagement'
import PaymentAnalyticsDashboard from './payment-analytics/PaymentAnalyticsDashboard-simple'
import AIWorkflows from '../pages/AIWorkflows'
import Chatbot from '../pages/Chatbot'

interface DashboardProps {
  onLogout: () => void
}

type PageType = 'carousel' | 'prompts' | 'data' | 'dashboard' | 'ai-workflows' | 'chatbot'

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('carousel')

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType)
  }

  const handleBack = () => {
    setCurrentPage('carousel')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'prompts':
        return <PromptRepository onBack={handleBack} />
      case 'data':
        return <DataManagement onBack={handleBack} />
      case 'dashboard':
        return <PaymentAnalyticsDashboard onBack={handleBack} />
      case 'ai-workflows':
        return <AIWorkflows onBack={handleBack} />
      case 'chatbot':
        return <Chatbot onBack={handleBack} />
      default:
        return <MainCarousel onNavigate={handleNavigate} />
    }
  }

  // Only show header on carousel page
  if (currentPage !== 'carousel') {
    return renderCurrentPage()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header - Only shown on carousel page */}
      <header className="bg-black border-b border-green-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-400">CollectiSense</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-green-400/70 hover:text-green-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-green-400/70 hover:text-green-400 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-green-400/70 hover:text-green-400 transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default Dashboard