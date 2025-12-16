'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, BarChart3, Settings } from 'lucide-react'
import { useVisualizationStore } from '../../lib/stores/visualization-store'

export function ViewModeToggle() {
  const { viewMode, showMetrics, animationSpeed } = useVisualizationStore()
  const { setViewMode, setShowMetrics, setAnimationSpeed } = useVisualizationStore()

  return (
    <div className="flex items-center space-x-3">
      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">View:</span>
        <motion.button
          className={`
            px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
            ${viewMode === 'detailed' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
          onClick={() => setViewMode('detailed')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Detailed
        </motion.button>
        <motion.button
          className={`
            px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200
            ${viewMode === 'simplified' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
          onClick={() => setViewMode('simplified')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Simple
        </motion.button>
      </div>

      {/* Metrics Toggle */}
      <motion.button
        className={`
          flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium 
          transition-colors duration-200
          ${showMetrics 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }
        `}
        onClick={() => setShowMetrics(!showMetrics)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Metrics</span>
      </motion.button>

      {/* Animation Speed Control */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">Speed:</span>
        <div className="flex items-center space-x-1">
          <motion.button
            className="p-1 text-gray-400 hover:text-white"
            onClick={() => setAnimationSpeed(Math.max(0.1, animationSpeed - 0.5))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </motion.button>
          
          <span className="text-sm font-medium text-white min-w-[2rem] text-center">
            {animationSpeed.toFixed(1)}x
          </span>
          
          <motion.button
            className="p-1 text-gray-400 hover:text-white"
            onClick={() => setAnimationSpeed(Math.min(3, animationSpeed + 0.5))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Settings Dropdown */}
      <SettingsDropdown />
    </div>
  )
}

function SettingsDropdown() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { filters, updateFilters } = useVisualizationStore()

  return (
    <div className="relative">
      <motion.button
        className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-medium text-white">Display Options</h3>
              
              {/* Show Only Errors */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.showOnlyErrors}
                  onChange={(e) => updateFilters({ showOnlyErrors: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-300">Show only errors</span>
              </label>

              {/* Hide Completed Steps */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.hideCompletedSteps}
                  onChange={(e) => updateFilters({ hideCompletedSteps: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-300">Hide completed steps</span>
              </label>

              {/* Agent Type Filter */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Agent Types</label>
                <div className="space-y-1">
                  {['upload', 'ingestion', 'classification', 'normalization', 'storage'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.agentTypes.length === 0 || filters.agentTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.agentTypes, type]
                            : filters.agentTypes.filter(t => t !== type)
                          updateFilters({ agentTypes: newTypes })
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-xs text-gray-400 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}