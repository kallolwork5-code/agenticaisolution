'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface LLMFallbackIndicatorProps {
  usedLLM: boolean
  fallbackReason?: string
  ruleAttempts?: Array<{
    rule: string
    result: 'passed' | 'failed' | 'insufficient'
    confidence?: number
    reason?: string
  }>
  llmProcessingTime?: number
  className?: string
}

export function LLMFallbackIndicator({
  usedLLM,
  fallbackReason,
  ruleAttempts = [],
  llmProcessingTime,
  className = ''
}: LLMFallbackIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!usedLLM && ruleAttempts.length === 0) {
    return (
      <div className={`llm-fallback-indicator ${className}`}>
        <div className="flex items-center space-x-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Rule-Based Classification</span>
          <CheckCircle className="w-4 h-4 text-green-400" />
        </div>
      </div>
    )
  }

  return (
    <div className={`llm-fallback-indicator ${className}`}>
      <div className="space-y-3">
        {/* Processing Method Indicator */}
        <div className={`p-3 rounded-lg border ${
          usedLLM 
            ? 'bg-purple-900/20 border-purple-500/30' 
            : 'bg-blue-900/20 border-blue-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {usedLLM ? (
                <Brain className="w-4 h-4 text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400" />
              )}
              <span className={`text-sm font-medium ${
                usedLLM ? 'text-purple-400' : 'text-blue-400'
              }`}>
                {usedLLM ? 'AI-Assisted Classification' : 'Rule-Based Classification'}
              </span>
              {usedLLM && llmProcessingTime && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{(llmProcessingTime / 1000).toFixed(2)}s</span>
                </div>
              )}
            </div>
            
            {(ruleAttempts.length > 0 || fallbackReason) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>Details</span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {fallbackReason && (
            <div className="mt-2 text-xs text-gray-300">
              {fallbackReason}
            </div>
          )}
        </div>

        {/* Detailed Processing Flow */}
        <AnimatePresence>
          {isExpanded && (ruleAttempts.length > 0 || usedLLM) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ProcessingFlow 
                ruleAttempts={ruleAttempts} 
                usedLLM={usedLLM}
                llmProcessingTime={llmProcessingTime}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ProcessingFlowProps {
  ruleAttempts: Array<{
    rule: string
    result: 'passed' | 'failed' | 'insufficient'
    confidence?: number
    reason?: string
  }>
  usedLLM: boolean
  llmProcessingTime?: number
}

function ProcessingFlow({ ruleAttempts, usedLLM, llmProcessingTime }: ProcessingFlowProps) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <h4 className="text-sm font-medium text-white mb-3">Processing Flow</h4>
      
      <div className="space-y-3">
        {/* Rule Attempts */}
        {ruleAttempts.map((attempt, index) => (
          <motion.div
            key={index}
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex-shrink-0 mt-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                attempt.result === 'passed' 
                  ? 'bg-green-600 text-white' 
                  : attempt.result === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}>
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">{attempt.rule}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  attempt.result === 'passed' 
                    ? 'bg-green-900/30 text-green-400' 
                    : attempt.result === 'failed'
                    ? 'bg-red-900/30 text-red-400'
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {attempt.result}
                </span>
              </div>
              
              {attempt.confidence !== undefined && (
                <div className="text-xs text-gray-400 mb-1">
                  Confidence: {Math.round(attempt.confidence * 100)}%
                </div>
              )}
              
              {attempt.reason && (
                <div className="text-xs text-gray-400">
                  {attempt.reason}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* LLM Fallback */}
        {usedLLM && (
          <>
            {ruleAttempts.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            )}
            
            <motion.div
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ruleAttempts.length * 0.1 + 0.2 }}
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-purple-400">LLM Analysis</span>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded">
                    activated
                  </span>
                </div>
                
                {llmProcessingTime && (
                  <div className="text-xs text-gray-400 mb-1">
                    Processing time: {(llmProcessingTime / 1000).toFixed(2)}s
                  </div>
                )}
                
                <div className="text-xs text-gray-400">
                  Advanced pattern recognition and contextual analysis applied
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

interface DecisionPathVisualizerProps {
  steps: Array<{
    type: 'rule' | 'llm'
    name: string
    status: 'success' | 'failure' | 'skipped'
    confidence?: number
    processingTime?: number
    details?: string
  }>
  className?: string
}

export function DecisionPathVisualizer({ steps, className = '' }: DecisionPathVisualizerProps) {
  return (
    <div className={`decision-path-visualizer ${className}`}>
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
        Decision Path
      </h4>
      
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-600" />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Step Icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === 'success' 
                  ? 'bg-green-600' 
                  : step.status === 'failure'
                  ? 'bg-red-600'
                  : 'bg-gray-600'
              }`}>
                {step.type === 'llm' ? (
                  <Brain className="w-4 h-4 text-white" />
                ) : (
                  <Zap className="w-4 h-4 text-white" />
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 pb-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-300">{step.name}</span>
                    <div className="flex items-center space-x-2">
                      {step.confidence !== undefined && (
                        <span className="text-xs text-gray-400">
                          {Math.round(step.confidence * 100)}%
                        </span>
                      )}
                      {step.processingTime && (
                        <span className="text-xs text-gray-400">
                          {(step.processingTime / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {step.details && (
                    <p className="text-xs text-gray-400">{step.details}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}