'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Building2, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

import { KPITile } from '../types'
import { ANIMATION_VARIANTS } from '../constants'
import { formatCurrencyValue, formatPercentageValue, formatNumberValue } from '../utils'

interface KPITilesProps {
  tiles: KPITile[]
}

// Icon mapping for different KPI types
const getKPIIcon = (label: string) => {
  const lowerLabel = label.toLowerCase()
  
  if (lowerLabel.includes('collection') || lowerLabel.includes('cost')) {
    return <DollarSign className="w-5 h-5" />
  }
  if (lowerLabel.includes('percentage') || lowerLabel.includes('%')) {
    return <Percent className="w-5 h-5" />
  }
  if (lowerLabel.includes('acquirer')) {
    return <Building2 className="w-5 h-5" />
  }
  if (lowerLabel.includes('time') || lowerLabel.includes('range')) {
    return <Calendar className="w-5 h-5" />
  }
  return <TrendingUp className="w-5 h-5" />
}

// Get trend icon
const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <ArrowUp className="w-3 h-3 text-green-400" />
    case 'down':
      return <ArrowDown className="w-3 h-3 text-red-400" />
    case 'neutral':
      return <Minus className="w-3 h-3 text-yellow-400" />
    default:
      return null
  }
}

// Get tile color based on content and warning status
const getTileColor = (tile: KPITile) => {
  if (tile.isWarning) {
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      value: 'text-red-300',
      label: 'text-red-200'
    }
  }
  
  const label = tile.label.toLowerCase()
  
  if (label.includes('collection')) {
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      value: 'text-blue-300',
      label: 'text-blue-200'
    }
  }
  
  if (label.includes('cost')) {
    return {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      icon: 'text-orange-400',
      value: 'text-orange-300',
      label: 'text-orange-200'
    }
  }
  
  if (label.includes('acquirer')) {
    return {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      value: 'text-purple-300',
      label: 'text-purple-200'
    }
  }
  
  // Default green theme
  return {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    value: 'text-green-300',
    label: 'text-green-200'
  }
}

// Format value based on type
const formatValue = (value: string, format: KPITile['format']) => {
  // If value is already formatted (contains symbols), return as-is
  if (value.includes('₹') || value.includes('%') || value.includes('–')) {
    return value
  }
  
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''))
  
  if (isNaN(numericValue)) {
    return value // Return original if not numeric
  }
  
  switch (format) {
    case 'currency':
      return formatCurrencyValue(numericValue)
    case 'percentage':
      return formatPercentageValue(numericValue)
    case 'number':
      return formatNumberValue(numericValue)
    default:
      return value
  }
}

const KPITiles: React.FC<KPITilesProps> = ({ tiles }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {tiles.map((tile, index) => {
        const colors = getTileColor(tile)
        const formattedValue = formatValue(tile.value, tile.format)
        
        return (
          <motion.div
            key={`${tile.label}-${index}`}
            className={`
              relative p-6 rounded-xl border backdrop-blur-sm
              ${colors.bg} ${colors.border}
              hover:bg-opacity-80 transition-all duration-300
              group cursor-default
            `}
            variants={ANIMATION_VARIANTS.scaleIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            {/* Header with icon and trend */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-black/20 ${colors.icon}`}>
                {getKPIIcon(tile.label)}
              </div>
              {tile.trend && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(tile.trend)}
                </div>
              )}
            </div>
            
            {/* Value */}
            <div className={`text-2xl font-bold mb-1 ${colors.value}`}>
              {formattedValue}
            </div>
            
            {/* Label */}
            <div className={`text-sm font-medium ${colors.label}`}>
              {tile.label}
            </div>
            
            {/* Warning indicator */}
            {tile.isWarning && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            )}
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default KPITiles