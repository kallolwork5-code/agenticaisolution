'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Brain, Zap } from 'lucide-react'

interface ConfidenceIndicatorProps {
  confidence: number
  usedLLM?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showIcon?: boolean
  className?: string
}

export function ConfidenceIndicator({
  confidence,
  usedLLM = false,
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = ''
}: ConfidenceIndicatorProps) {
  const getConfidenceLevel = () => {
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  }

  const getConfidenceColor = () => {
    const level = getConfidenceLevel()
    switch (level) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceIcon = () => {
    const level = getConfidenceLevel()
    switch (level) {
      case 'high': return CheckCircle
      case 'medium': return AlertTriangle
      case 'low': return XCircle
      default: return AlertTriangle
    }
  }

  const getConfidenceLabel = () => {
    const level = getConfidenceLevel()
    switch (level) {
      case 'high': return 'High Confidence'
      case 'medium': return 'Medium Confidence'
      case 'low': return 'Low Confidence'
      default: return 'Unknown'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return {
        container: 'text-xs',
        icon: 'w-3 h-3',
        bar: 'h-1',
        percentage: 'text-xs'
      }
      case 'lg': return {
        container: 'text-base',
        icon: 'w-6 h-6',
        bar: 'h-3',
        percentage: 'text-lg'
      }
      default: return {
        container: 'text-sm',
        icon: 'w-4 h-4',
        bar: 'h-2',
        percentage: 'text-sm'
      }
    }
  }

  const ConfidenceIcon = getConfidenceIcon()
  const ProcessingIcon = usedLLM ? Brain : Zap
  const sizeClasses = getSizeClasses()
  const confidenceColor = getConfidenceColor()

  return (
    <div className={`confidence-indicator ${sizeClasses.container} ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
        {showIcon && (
          <div className="flex items-center space-x-1">
            <ConfidenceIcon className={`${sizeClasses.icon} ${confidenceColor}`} />
            {usedLLM && (
              <ProcessingIcon className={`${sizeClasses.icon} text-purple-400`} />
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-2 flex-1">
          <span className={`font-medium ${confidenceColor} ${sizeClasses.percentage}`}>
            {Math.round(confidence * 100)}%
          </span>
          {showLabel && (
            <span className="text-gray-400">
              {getConfidenceLabel()}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full bg-gray-700 rounded-full ${sizeClasses.bar} overflow-hidden`}>
        <motion.div
          className={`${sizeClasses.bar} rounded-full ${
            getConfidenceLevel() === 'high' 
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : getConfidenceLevel() === 'medium'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
              : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Processing Method Indicator */}
      {usedLLM && (
        <motion.div
          className="flex items-center space-x-1 mt-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-400">AI-Assisted</span>
        </motion.div>
      )}
    </div>
  )
}

interface ConfidenceComparisonProps {
  confidences: Array<{
    label: string
    confidence: number
    usedLLM?: boolean
    isSelected?: boolean
  }>
  className?: string
}

export function ConfidenceComparison({ confidences, className = '' }: ConfidenceComparisonProps) {
  return (
    <div className={`confidence-comparison space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        Classification Confidence
      </h4>
      
      {confidences.map((item, index) => (
        <motion.div
          key={index}
          className={`
            p-3 rounded-lg border transition-colors
            ${item.isSelected 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-gray-800/50 border-gray-600'
            }
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${
              item.isSelected ? 'text-green-400' : 'text-gray-300'
            }`}>
              {item.label}
            </span>
            {item.isSelected && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          
          <ConfidenceIndicator
            confidence={item.confidence}
            usedLLM={item.usedLLM}
            size="sm"
            showLabel={false}
            showIcon={false}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface ConfidenceHistoryProps {
  history: Array<{
    timestamp: Date
    confidence: number
    classification: string
    usedLLM: boolean
  }>
  className?: string
}

export function ConfidenceHistory({ history, className = '' }: ConfidenceHistoryProps) {
  return (
    <div className={`confidence-history ${className}`}>
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
        Decision History
      </h4>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3 p-2 rounded bg-gray-800/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${
                entry.confidence >= 0.8 
                  ? 'bg-green-400' 
                  : entry.confidence >= 0.6 
                  ? 'bg-yellow-400' 
                  : 'bg-red-400'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-300 truncate">
                  {entry.classification}
                </span>
                {entry.usedLLM && (
                  <Brain className="w-3 h-3 text-purple-400 flex-shrink-0" />
                )}
              </div>
              <div className="text-xs text-gray-500">
                {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex-shrink-0 text-xs font-medium text-gray-300">
              {Math.round(entry.confidence * 100)}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}