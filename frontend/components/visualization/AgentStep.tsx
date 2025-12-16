'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Zap,
  Upload,
  Database,
  Brain,
  Settings,
  Save
} from 'lucide-react'
import { AgentStep as AgentStepType } from '../../lib/types/visualization'

interface AgentStepProps {
  step: AgentStepType
  isActive: boolean
  isSelected?: boolean
  onClick: () => void
  showDetails: boolean
  showMetrics: boolean
  animationSpeed: number
  compact?: boolean
}

const stepIcons = {
  upload: Upload,
  ingestion: Database,
  classification: Brain,
  normalization: Settings,
  storage: Save
}

const statusColors = {
  pending: 'text-gray-400 bg-gray-800',
  active: 'text-green-400 bg-green-900/30',
  completed: 'text-green-500 bg-green-900/50',
  error: 'text-red-400 bg-red-900/30',
  retrying: 'text-orange-400 bg-orange-900/30'
}

const statusIcons = {
  pending: Clock,
  active: Zap,
  completed: CheckCircle,
  error: AlertCircle,
  retrying: RotateCcw
}

export function AgentStep({
  step,
  isActive,
  isSelected = false,
  onClick,
  showDetails,
  showMetrics,
  animationSpeed,
  compact = false
}: AgentStepProps) {
  const StepIcon = stepIcons[step.id as keyof typeof stepIcons] || Database
  const StatusIcon = statusIcons[step.status]
  
  const pulseAnimation = isActive ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2 / animationSpeed,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {}

  const rotateAnimation = step.status === 'retrying' ? {
    rotate: [0, 360],
    transition: {
      duration: 2 / animationSpeed,
      repeat: Infinity,
      ease: "linear"
    }
  } : {}

  if (compact) {
    return (
      <motion.button
        className={`
          relative p-3 rounded-full border-2 transition-all duration-200
          ${statusColors[step.status]}
          ${isActive ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-gray-600'}
          hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400/50
        `}
        onClick={onClick}
        animate={pulseAnimation}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div animate={rotateAnimation}>
          <StepIcon className="w-6 h-6" />
        </motion.div>
        
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-700"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-green-400"
            strokeDasharray={`${2 * Math.PI * 0.45 * 24}`}
            initial={{ strokeDashoffset: `${2 * Math.PI * 0.45 * 24}` }}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 0.45 * 24 * (1 - step.progress / 100)}` 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.button>
    )
  }

  return (
    <motion.div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${statusColors[step.status]}
        ${isActive ? 'border-green-400 shadow-lg shadow-green-400/20' : 'border-gray-600'}
        ${isSelected ? 'ring-2 ring-blue-400/50' : ''}
        hover:border-green-300 hover:shadow-md
      `}
      onClick={onClick}
      animate={pulseAnimation}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <motion.div animate={rotateAnimation}>
            <StepIcon className="w-5 h-5" />
          </motion.div>
          <h4 className="font-medium text-sm">{step.name}</h4>
        </div>
        <StatusIcon className="w-4 h-4" />
      </div>

      {/* Description */}
      {showDetails && (
        <p className="text-xs text-gray-400 mb-3">{step.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-medium">{step.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${
              step.status === 'error' 
                ? 'bg-red-400' 
                : step.status === 'completed'
                ? 'bg-green-400'
                : 'bg-blue-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${step.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Confidence Score */}
      {step.confidence !== undefined && showDetails && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Confidence</span>
            <span className="text-xs font-medium">{Math.round(step.confidence * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-green-400 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${step.confidence * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && showDetails && step.metrics && (
        <div className="space-y-1 text-xs">
          {step.metrics.processingTime > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span>{(step.metrics.processingTime / 1000).toFixed(1)}s</span>
            </div>
          )}
          {step.metrics.memoryUsage > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Memory:</span>
              <span>{(step.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          )}
          {step.metrics.throughput > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Throughput:</span>
              <span>{step.metrics.throughput.toFixed(1)}/s</span>
            </div>
          )}
        </div>
      )}

      {/* Decision Indicator */}
      {step.decision && showDetails && (
        <motion.div
          className="mt-3 p-2 bg-gray-800/50 rounded text-xs"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400">Classification:</span>
            <span className="font-medium">{step.decision.classification}</span>
          </div>
          {step.decision.usedLLM && (
            <div className="flex items-center space-x-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400">LLM Assisted</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Timing */}
      {showDetails && (step.startTime || step.endTime) && (
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400">
          {step.startTime && (
            <div>Started: {step.startTime.toLocaleTimeString()}</div>
          )}
          {step.endTime && (
            <div>Completed: {step.endTime.toLocaleTimeString()}</div>
          )}
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}