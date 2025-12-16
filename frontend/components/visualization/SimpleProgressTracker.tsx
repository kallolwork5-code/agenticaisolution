'use client'

import React from 'react'

interface SimpleProgressTrackerProps {
  progress: number
  currentStep: string
  timeRemaining?: number
}

const SimpleProgressTracker: React.FC<SimpleProgressTrackerProps> = ({
  progress,
  currentStep,
  timeRemaining
}) => {
  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'Calculating...'
    if (seconds < 60) return `${Math.round(seconds)}s`
    return `${Math.round(seconds / 60)}m`
  }

  return (
    <div className="p-4 bg-white border rounded-lg">
      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded h-2 mt-1">
          <div 
            className="bg-blue-500 h-2 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <div>Step: {currentStep}</div>
        {timeRemaining && <div>ETA: {formatTime(timeRemaining)}</div>}
      </div>
    </div>
  )
}

export default SimpleProgressTracker