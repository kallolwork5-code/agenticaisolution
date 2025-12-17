'use client'

import React from 'react'
import SLADelayDashboard from './sla-delay/SLADelayDashboard'

// Simple test component to verify SLA Delay dashboard works
const TestSLADelayDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">SLA Delay Dashboard Test</h1>
        <SLADelayDashboard />
      </div>
    </div>
  )
}

export default TestSLADelayDashboard