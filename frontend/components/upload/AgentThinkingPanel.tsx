'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Search, 
  Target, 
  CheckCircle, 
  Clock,
  Lightbulb,
  Database
} from 'lucide-react'

interface AgentThought {
  id: string
  timestamp: Date
  type: 'analysis' | 'prompt' | 'rule' | 'decision'
  content: string
  confidence: number
  metadata?: {
    promptUsed?: string
    ruleApplied?: string
    dataPoints?: number
    processingTime?: number
  }
}

interface AgentThinkingPanelProps {
  thoughts: AgentThought[]
  isActive: boolean
  currentStage: string
  className?: string
}

const AgentThinkingPanel: React.FC<AgentThinkingPanelProps> = ({
  thoughts,
  isActive,
  currentStage,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest thought
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thoughts])

  // Get thought type configuration
  const getThoughtTypeConfig = (type: AgentThought['type']) => {
    switch (type) {
      case 'analysis':
        return {
          icon: Search,
          color: 'bg-blue-500/20 text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        }
      case 'prompt':
        return {
          icon: Lightbulb,
          color: 'bg-yellow-500/20 text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        }
      case 'rule':
        return {
          icon: Target,
          color: 'bg-purple-500/20 text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/20'
        }
      case 'decision':
        return {
          icon: CheckCircle,
          color: 'bg-green-500/20 text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        }
      default:
        return {
          icon: Brain,
          color: 'bg-gray-500/20 text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20'
        }
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-400'
    if (confidence >= 0.6) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Get stage icon
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'upload':
        return <Database className="w-4 h-4" />
      case 'analyze':
        return <Search className="w-4 h-4" />
      case 'classify':
        return <Brain className="w-4 h-4" />
      case 'store':
        return <Target className="w-4 h-4" />
      case 'complete':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-400' : 'bg-gray-400'
            }`}
            animate={{
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [1, 0.7, 1] : 0.5
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
          <Brain className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Agent Thinking</h3>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-white/60">
            {getStageIcon(currentStage)}
            <span className="capitalize">{currentStage}</span>
          </div>
          {isActive && (
            <motion.div
              className="flex space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Thoughts Container */}
      <div 
        ref={scrollRef}
        className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        <AnimatePresence mode="popLayout">
          {thoughts.length === 0 ? (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Brain className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                {isActive ? 'Agent is preparing to think...' : 'No active thinking process'}
              </p>
            </motion.div>
          ) : (
            thoughts.map((thought, index) => {
              const config = getThoughtTypeConfig(thought.type)
              const Icon = config.icon

              return (
                <motion.div
                  key={thought.id}
                  className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1
                  }}
                  layout
                >
                  {/* Thought Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${config.color}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className={`text-xs font-medium capitalize ${config.color.split(' ')[1]}`}>
                        {thought.type}
                      </span>
                      {thought.metadata?.promptUsed && (
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60">
                          Prompt: {thought.metadata.promptUsed}
                        </span>
                      )}
                      {thought.metadata?.ruleApplied && (
                        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60">
                          Rule: {thought.metadata.ruleApplied}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/40">
                        {formatTimestamp(thought.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Thought Content */}
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    {thought.content}
                  </p>

                  {/* Metadata */}
                  {thought.metadata && (
                    <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                      {thought.metadata.dataPoints && (
                        <span>Data points: {thought.metadata.dataPoints.toLocaleString()}</span>
                      )}
                      {thought.metadata.processingTime && (
                        <span>Processing: {thought.metadata.processingTime}ms</span>
                      )}
                    </div>
                  )}

                  {/* Confidence Indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">Confidence</span>
                      <div className="w-20 bg-white/10 rounded-full h-1.5">
                        <motion.div
                          className={`h-1.5 rounded-full ${getConfidenceColor(thought.confidence)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${thought.confidence * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white">
                        {Math.round(thought.confidence * 100)}%
                      </span>
                    </div>

                    {/* Thought Actions */}
                    <div className="flex items-center gap-1">
                      {thought.type === 'decision' && (
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: 2 }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      {thoughts.length > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-400">
                {thoughts.filter(t => t.type === 'analysis').length}
              </p>
              <p className="text-xs text-white/60">Analysis</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-400">
                {thoughts.filter(t => t.type === 'prompt').length}
              </p>
              <p className="text-xs text-white/60">Prompts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-400">
                {thoughts.filter(t => t.type === 'rule').length}
              </p>
              <p className="text-xs text-white/60">Rules</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">
                {thoughts.filter(t => t.type === 'decision').length}
              </p>
              <p className="text-xs text-white/60">Decisions</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AgentThinkingPanel