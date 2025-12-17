'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BarChart3 } from 'lucide-react'

import { PaymentAnalyticsDashboardProps, DashboardTab } from './types'
import { DASHBOARD_TABS, ANIMATION_VARIANTS } from './constants'
import { validateDashboardData } from './utils'
import { 
  executiveDashboardData, 
  rateReconciliationData, 
  slaDelayData, 
  routingNonComplianceData,
  dashboardTabs 
} from './data'

// Import dashboard components
import DashboardNavigation from './DashboardNavigation'
import ExecutiveDashboard from './executive/ExecutiveDashboard'
import RateReconciliationDashboard from './rate-reconciliation/RateReconciliationDashboard'
import SLADelayDashboard from './sla-delay/SLADelayDashboard'
import RoutingNonComplianceDashboard from './routing/RoutingNonComplianceDashboard'

const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({ onBack }) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>(DASHBOARD_TABS.EXECUTIVE)
  const [isLoading, setIsLoading] = useState(true)
  const [dataValidated, setDataValidated] = useState(false)

  // Initialize dashboard data validation
  useEffect(() => {
    const validateAllData = () => {
      try {
        const validations = [
          validateDashboardData(executiveDashboardData),
          validateDashboardData(rateReconciliationData),
          validateDashboardData(slaDelayData),
          validateDashboardData(routingNonComplianceData)
        ]

        const allValid = validations.every(Boolean)
        setDataValidated(allValid)
        
        if (!allValid) {
          console.error('Dashboard data validation failed')
        }
      } catch (error) {
        console.error('Error validating dashboard data:', error)
        setDataValidated(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Simulate brief loading time for smooth UX
    const timer = setTimeout(validateAllData, 300)
    return () => clearTimeout(timer)
  }, [])

  // Tab change handler
  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId)
    }
  }

  // Render active dashboard component
  const renderActiveDashboard = () => {
    switch (activeTab) {
      case DASHBOARD_TABS.EXECUTIVE:
        return <ExecutiveDashboard />
      case DASHBOARD_TABS.RATE_RECONCILIATION:
        return <RateReconciliationDashboard />
      case DASHBOARD_TABS.SLA_DELAY:
        return <SLADelayDashboard />
      case DASHBOARD_TABS.ROUTING_COMPLIANCE:
        return <RoutingNonComplianceDashboard />
      default:
        return <ExecutiveDashboard />
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white/60">Loading Payment Analytics Dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!dataValidated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Data Validation Failed</h2>
          <p className="text-white/60 mb-4">
            There was an issue loading the dashboard data. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-400" />
                Payment Analytics Dashboard
              </h1>
              <p className="text-white/60 text-sm">
                Comprehensive payment processing insights and compliance monitoring
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Data</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DashboardNavigation
            tabs={dashboardTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={ANIMATION_VARIANTS.fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderActiveDashboard()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-8 p-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-white/40 text-sm">
                Data as of: 01 Jan 2024 – 31 Mar 2024 | Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-white/40 text-sm">
                <span>Total Collection: ₹2,421 Cr</span>
                <span>•</span>
                <span>4 Acquirers</span>
                <span>•</span>
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentAnalyticsDashboard