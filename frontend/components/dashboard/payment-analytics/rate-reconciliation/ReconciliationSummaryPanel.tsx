'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  AlertTriangle, 
  Percent, 
  TrendingDown,
  TrendingUp,
  Target,
  Calculator
} from 'lucide-react'

import { SummaryPanelProps } from '../types'
import { rateReconciliationData } from '../data'
import { ANIMATION_VARIANTS, SLA_THRESHOLDS } from '../constants'
import { formatCurrencyValue, formatPercentageValue, formatNumberValue } from '../utils'

interface ReconciliationSummaryPanelProps {
  data?: typeof rateReconciliationData.summary
  showInsights?: boolean
}

const ReconciliationSummaryPanel: React.FC<ReconciliationSummaryPanelProps> = ({
  data = rateReconciliationData.summary,
  showInsights = true
}) => {
  // Calculate additional metrics
  const errorRate = data.errorPercentage
  const savingsRate = (parseFloat(data.savingAmount.replace(/[^\d.-]/g, '')) / 
                      parseFloat(data.totalCollection.replace(/[^\d.-]/g, ''))) * 100

  // Get status information based on error rate
  const getErrorStatus = (errorPercentage: number) => {
    if (errorPercentage >= SLA_THRESHOLDS.ERROR_PERCENTAGE.CRITICAL) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
        icon: <AlertTriangle className="w-5 h-5" />,
        status: 'Critical',
        trend: 'critical'
      }
    } else if (errorPercentage >= SLA_THRESHOLDS.ERROR_PERCENTAGE.WARNING) {
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30',
        icon: <TrendingUp className="w-5 h-5" />,
        status: 'High',
        trend: 'warning'
      }
    } else {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30',
        icon: <Target className="w-5 h-5" />,
        status: 'Good',
        trend: 'good'
      }
    }
  }

  const errorStatus = getErrorStatus(errorRate)

  // Summary metrics configuration
  const summaryMetrics = [
    {
      label: 'Total Collection',
      value: data.totalCollection,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      trend: 'neutral',
      description: 'Total transaction volume processed'
    },
    {
      label: 'Transaction Errors',
      value: formatNumberValue(data.transactionErrors),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: errorStatus.color,
      bgColor: errorStatus.bgColor,
      trend: 'up',
      description: 'MDR rate discrepancies identified'
    },
    {
      label: 'Error Percentage',
      value: formatPercentageValue(data.errorPercentage),
      icon: <Percent className="w-5 h-5" />,
      color: errorStatus.color,
      bgColor: errorStatus.bgColor,
      trend: 'up',
      description: `${errorStatus.status} error rate`
    },
    {
      label: 'Potential Savings',
      value: data.savingAmount,
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/30',
      trend: 'down',
      description: 'Recoverable amount from corrections'
    }
  ]

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Calculator className="w-6 h-6 text-orange-400" />
            Rate Reconciliation Summary
          </h3>
          <p className="text-white/60 mt-1">
            MDR rate compliance analysis and potential savings identification
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">Analysis Period</div>
          <div className="text-white font-medium">Q1 2024</div>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            className={`
              relative p-4 rounded-xl border backdrop-blur-sm
              ${metric.bgColor}
              hover:bg-opacity-80 transition-all duration-300
              group cursor-default
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            {/* Icon and Trend */}
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-black/20 ${metric.color}`}>
                {metric.icon}
              </div>
              {metric.trend !== 'neutral' && (
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-red-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-400" />
                  )}
                </div>
              )}
            </div>
            
            {/* Value */}
            <div className={`text-2xl font-bold mb-1 ${metric.color}`}>
              {metric.value}
            </div>
            
            {/* Label */}
            <div className="text-white/80 text-sm font-medium mb-1">
              {metric.label}
            </div>
            
            {/* Description */}
            <div className="text-white/60 text-xs">
              {metric.description}
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        ))}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Savings Rate</span>
          </div>
          <div className="text-blue-300 text-xl font-bold">{savingsRate.toFixed(2)}%</div>
          <div className="text-blue-200 text-xs">Of total collection volume</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Avg Error Value</span>
          </div>
          <div className="text-purple-300 text-xl font-bold">
            ₹{(parseFloat(data.savingAmount.replace(/[^\d.-]/g, '')) / data.transactionErrors * 10000000).toFixed(0)}
          </div>
          <div className="text-purple-200 text-xs">Per error transaction</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Recovery Potential</span>
          </div>
          <div className="text-green-300 text-xl font-bold">High</div>
          <div className="text-green-200 text-xs">Immediate action recommended</div>
        </div>
      </div>

      {/* Status and Insights */}
      {showInsights && (
        <div className="space-y-3">
          {/* Error Rate Status */}
          <div className={`${errorStatus.bgColor} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {errorStatus.icon}
              <span className={`${errorStatus.color} text-sm font-medium`}>
                Error Rate Status: {errorStatus.status}
              </span>
            </div>
            <p className={`${errorStatus.color} text-sm`}>
              {errorRate >= SLA_THRESHOLDS.ERROR_PERCENTAGE.CRITICAL
                ? `Critical error rate of ${errorRate}% requires immediate attention and process review.`
                : errorRate >= SLA_THRESHOLDS.ERROR_PERCENTAGE.WARNING
                ? `High error rate of ${errorRate}% indicates systematic issues in rate application.`
                : `Error rate of ${errorRate}% is within acceptable limits but monitoring recommended.`
              }
            </p>
          </div>

          {/* Savings Opportunity */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Savings Opportunity</span>
            </div>
            <p className="text-green-300 text-sm">
              {data.savingAmount} in potential savings identified from {data.transactionErrors} error transactions. 
              Immediate reconciliation could recover significant revenue.
            </p>
          </div>

          {/* Action Items */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Recommended Actions</span>
            </div>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Review and correct {data.transactionErrors} identified rate discrepancies</li>
              <li>• Implement automated rate validation to prevent future errors</li>
              <li>• Establish regular reconciliation processes with acquirers</li>
              <li>• Monitor error trends to identify systematic issues</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ReconciliationSummaryPanel