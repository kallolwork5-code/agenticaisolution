'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  Route,
  TrendingUp
} from 'lucide-react'

import { NavigationProps } from './types'
import { DASHBOARD_TABS } from './constants'

// Icon mapping for dashboard tabs
const getTabIcon = (tabId: string) => {
  switch (tabId) {
    case DASHBOARD_TABS.EXECUTIVE:
      return <BarChart3 className="w-4 h-4" />
    case DASHBOARD_TABS.RATE_RECONCILIATION:
      return <AlertTriangle className="w-4 h-4" />
    case DASHBOARD_TABS.SLA_DELAY:
      return <Clock className="w-4 h-4" />
    case DASHBOARD_TABS.ROUTING_COMPLIANCE:
      return <Route className="w-4 h-4" />
    default:
      return <TrendingUp className="w-4 h-4" />
  }
}

// Get tab color based on type
const getTabColor = (tabId: string, isActive: boolean) => {
  const colors = {
    [DASHBOARD_TABS.EXECUTIVE]: {
      active: 'text-blue-400 border-blue-400 bg-blue-500/10',
      inactive: 'text-white/60 border-transparent hover:text-blue-300 hover:border-blue-400/50'
    },
    [DASHBOARD_TABS.RATE_RECONCILIATION]: {
      active: 'text-orange-400 border-orange-400 bg-orange-500/10',
      inactive: 'text-white/60 border-transparent hover:text-orange-300 hover:border-orange-400/50'
    },
    [DASHBOARD_TABS.SLA_DELAY]: {
      active: 'text-red-400 border-red-400 bg-red-500/10',
      inactive: 'text-white/60 border-transparent hover:text-red-300 hover:border-red-400/50'
    },
    [DASHBOARD_TABS.ROUTING_COMPLIANCE]: {
      active: 'text-purple-400 border-purple-400 bg-purple-500/10',
      inactive: 'text-white/60 border-transparent hover:text-purple-300 hover:border-purple-400/50'
    }
  }

  return colors[tabId as keyof typeof colors]?.[isActive ? 'active' : 'inactive'] || 
         'text-white/60 border-transparent hover:text-white hover:border-white/50'
}

const DashboardNavigation: React.FC<NavigationProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <nav className="flex space-x-8" aria-label="Dashboard navigation">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id
              const tabColor = getTabColor(tab.id, isActive)
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm
                    transition-all duration-200 ${tabColor}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {getTabIcon(tab.id)}
                  <span>{tab.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-transparent via-white/5 to-transparent"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="relative">
            {/* Mobile dropdown button */}
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  {getTabIcon(activeTab)}
                  <span className="font-medium">
                    {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile tab buttons */}
            <div className="grid grid-cols-2 gap-2 pb-4">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id
                const tabColor = getTabColor(tab.id, isActive)
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                      flex items-center justify-center gap-2 px-3 py-2 rounded-lg border
                      text-xs font-medium transition-all duration-200 ${tabColor}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {getTabIcon(tab.id)}
                    <span className="truncate">{tab.name}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardNavigation