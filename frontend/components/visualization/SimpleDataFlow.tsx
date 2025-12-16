'use client'

import React from 'react'

interface SimpleDataFlowProps {
  isActive: boolean
  dataType: string
}

const SimpleDataFlow: React.FC<SimpleDataFlowProps> = ({
  isActive,
  dataType
}) => {
  if (!isActive) return null

  return (
    <div className="flex items-center justify-center h-8 bg-blue-50 rounded">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-xs text-blue-600">{dataType} data flowing</span>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export default SimpleDataFlow