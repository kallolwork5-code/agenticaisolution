'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AgentStep } from './AgentStep'
import { ProcessingState } from '../../lib/types/visualization'
import { useVisualizationStore } from '../../lib/stores/visualization-store'

interface PipelineVisualizerProps {
  fileId: string
  processingState: ProcessingState
  onStepClick: (stepId: string) => void
  className?: string
}

export function PipelineVisualizer({ 
  fileId, 
  processingState, 
  onStepClick, 
  className = '' 
}: PipelineVisualizerProps) {
  const { viewMode, showMetrics, selectedStep } = useVisualizationStore()

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      className={`pipeline-visualizer bg-gray-900 rounded-lg p-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">
          Processing Pipeline
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>File: {fileId}</span>
          <span>•</span>
          <span>Progress: {processingState.overallProgress}%</span>
          {processingState.estimatedTimeRemaining > 0 && (
            <>
              <span>•</span>
              <span>
                ETA: {Math.ceil(processingState.estimatedTimeRemaining / 1000)}s
              </span>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="pipeline-steps">
        {viewMode === 'detailed' ? (
          <DetailedPipelineView
            steps={processingState.steps}
            currentStep={processingState.currentStep}
            selectedStep={selectedStep}
            onStepClick={onStepClick}
            showMetrics={showMetrics}
            stepVariants={stepVariants}
          />
        ) : (
          <SimplifiedPipelineView
            steps={processingState.steps}
            currentStep={processingState.currentStep}
            onStepClick={onStepClick}
            stepVariants={stepVariants}
          />
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-400">
            {processingState.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${processingState.overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Error Display */}
      {processingState.errors.length > 0 && (
        <motion.div
          className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-red-400 font-medium mb-2">Processing Errors</h4>
          <div className="space-y-2">
            {processingState.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-300">
                <span className="font-medium">{error.type}:</span> {error.message}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

interface DetailedPipelineViewProps {
  steps: ProcessingState['steps']
  currentStep: string
  selectedStep: string | null
  onStepClick: (stepId: string) => void
  showMetrics: boolean
  stepVariants: any
}

function DetailedPipelineView({
  steps,
  currentStep,
  selectedStep,
  onStepClick,
  showMetrics,
  stepVariants
}: DetailedPipelineViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {steps.map((step, index) => (
        <motion.div key={step.id} variants={stepVariants}>
          <AgentStep
            step={step}
            isActive={step.id === currentStep}
            isSelected={step.id === selectedStep}
            onClick={() => onStepClick(step.id)}
            showDetails={true}
            showMetrics={showMetrics}
            animationSpeed={1}
          />
          {/* Connection Line */}
          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-600 transform -translate-y-1/2" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

interface SimplifiedPipelineViewProps {
  steps: ProcessingState['steps']
  currentStep: string
  onStepClick: (stepId: string) => void
  stepVariants: any
}

function SimplifiedPipelineView({
  steps,
  currentStep,
  onStepClick,
  stepVariants
}: SimplifiedPipelineViewProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <motion.div variants={stepVariants} className="flex-shrink-0">
            <AgentStep
              step={step}
              isActive={step.id === currentStep}
              isSelected={false}
              onClick={() => onStepClick(step.id)}
              showDetails={false}
              showMetrics={false}
              animationSpeed={1}
              compact={true}
            />
          </motion.div>
          {/* Arrow */}
          {index < steps.length - 1 && (
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-gray-500 transform rotate-90 sm:rotate-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}