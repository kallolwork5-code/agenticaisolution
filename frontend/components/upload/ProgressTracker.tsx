'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Brain, 
  Database, 
  CheckCircle, 
  Clock,
  AlertCircle,
  X
} from 'lucide-react'

interface ProgressStage {
  id: string
  name: string
  status: 'pending' | 'active' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
  error?: string
}

interface ProgressTrackerProps {
  stages: ProgressStage[]
  currentStage: string
  overallProgress: number
  estimatedTimeRemaining?: number
  onCancel?: () => void
  className?: string
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  stages,
  currentStage,
  overallProgress,
  estimatedTimeRemaining,
  onCancel,
  className = ''
}) => {
  // Get stage icon
  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'upload':
        return Upload
      case 'analyze':
        return Search
      case 'classify':
        return Brain
      case 'store':
        return Database
      case 'complete':
        return CheckCircle
      default:
        return Clock
    }
  }

  // Get stage status color
  const getStatusColor = (status: ProgressStage['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'active':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-white/40 bg-white/5 border-white/10'
    }
  }

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">Upload Progress</h3>
          <p className="text-white/60 text-sm">Processing your data file</p>
        </div>
        
        <div className="flex items-center gap-4">
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="text-right">
              <p className="text-white/60 text-xs">Time remaining</p>
              <p className="text-white font-medium">{formatTimeRemaining(estimatedTimeRemaining)}</p>
            </div>
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
              title="Cancel upload"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Overall Progress</span>
          <span className="text-white font-medium">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className="bg-green-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stage Progress */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const Icon = getStageIcon(stage.id)
          const isActive = stage.status === 'active'
          const isCompleted = stage.status === 'completed'
          const hasError = stage.status === 'error'

          return (
            <motion.div
              key={stage.id}
              className={`
                flex items-center gap-4 p-4 rounded-lg border transition-all duration-300
                ${getStatusColor(stage.status)}
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Stage Icon */}
              <div className="relative">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : isActive 
                        ? 'bg-blue-500/20 border-blue-500' 
                        : hasError
                          ? 'bg-red-500/20 border-red-500'
                          : 'bg-white/5 border-white/20'
                    }
                  `}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {hasError ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />
                  )}
                </motion.div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -inset-1 rounded-full border-2 border-blue-400"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium">{stage.name}</h4>
                  <span className="text-white/60 text-sm">
                    {Math.round(stage.progress)}%
                  </span>
                </div>

                {/* Stage Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                  <motion.div
                    className={`
                      h-1.5 rounded-full transition-colors duration-300
                      ${isCompleted 
                        ? 'bg-green-400' 
                        : isActive 
                          ? 'bg-blue-400' 
                          : hasError
                            ? 'bg-red-400'
                            : 'bg-white/20'
                      }
                    `}
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Stage Details */}
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-4">
                    {stage.startTime && (
                      <span>Started: {stage.startTime.toLocaleTimeString()}</span>
                    )}
                    {stage.endTime && (
                      <span>Completed: {stage.endTime.toLocaleTimeString()}</span>
                    )}
                  </div>
                  
                  {stage.startTime && !stage.endTime && isActive && (
                    <span>
                      Duration: {Math.round((Date.now() - stage.startTime.getTime()) / 1000)}s
                    </span>
                  )}
                </div>

                {/* Error Message */}
                {hasError && stage.error && (
                  <motion.div
                    className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-red-400 text-xs">{stage.error}</p>
                  </motion.div>
                )}
              </div>

              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div className="absolute left-9 top-16 w-0.5 h-8 bg-white/10" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        className="mt-6 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-green-400">
              {stages.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-xs text-white/60">Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-400">
              {stages.filter(s => s.status === 'active').length}
            </p>
            <p className="text-xs text-white/60">Active</p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-400">
              {stages.filter(s => s.status === 'error').length}
            </p>
            <p className="text-xs text-white/60">Errors</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProgressTracker