'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, RefreshCw } from 'lucide-react'
import { ChartContainerProps } from '@/lib/chart-types'

// Loading skeleton component
export const ChartSkeleton: React.FC = () => (
  <div className="h-48 bg-white/5 rounded-xl animate-pulse">
    <div className="h-full flex items-end justify-center gap-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="bg-white/20 rounded-t animate-pulse"
          style={{ 
            width: '20px', 
            height: `${Math.random() * 100 + 50}px` 
          }}
        />
      ))}
    </div>
  </div>
)

// Error component with retry functionality
export const ChartError: React.FC<{ message: string; onRetry?: () => void }> = ({ 
  message, 
  onRetry 
}) => (
  <div className="h-48 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-red-500/20">
    <div className="text-red-400 mb-4">
      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
      <p className="text-sm text-center">{message}</p>
    </div>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-black rounded-lg text-sm hover:bg-green-400 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    )}
  </div>
)

// Main chart container component
const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading = false,
  error,
  onRetry
}) => {
  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-green-400" />
        </div>
      </div>
      
      {loading ? (
        <ChartSkeleton />
      ) : error ? (
        <ChartError message={error} onRetry={onRetry} />
      ) : (
        <div className="h-48">
          {children}
        </div>
      )}
    </motion.div>
  )
}

export default ChartContainer