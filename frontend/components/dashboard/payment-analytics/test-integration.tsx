// Test integration file for PaymentAnalyticsDashboard
// This file can be used to test the main component during development

import React from 'react'
import { PaymentAnalyticsDashboard } from './index'

const TestPaymentAnalyticsDashboard: React.FC = () => {
  const handleBack = () => {
    console.log('Back button clicked - would navigate to previous page')
  }

  return (
    <div>
      <PaymentAnalyticsDashboard onBack={handleBack} />
    </div>
  )
}

export default TestPaymentAnalyticsDashboard

// Usage example:
// import TestPaymentAnalyticsDashboard from './components/dashboard/payment-analytics/test-integration'
// 
// function App() {
//   return <TestPaymentAnalyticsDashboard />
// }