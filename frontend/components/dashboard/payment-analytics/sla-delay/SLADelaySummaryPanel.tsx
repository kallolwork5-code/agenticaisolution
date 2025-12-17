'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Percent,
  TrendingUp,
  Timer,
  Calendar,
  Target
} from 'lucide-react'

import { SummaryPanelProps } from '../types'
import { slaDelayData } from '../data'
import { ANIMATION_VARIANTS, SLA_THRESHOLDS } from '../constants'
import { formatCurrencyValue, formatPercentageValue, formatNumberValue } from '../utils'

interface SLADelaySummaryPanelProps {
  data?: typeof slaDelayData.summary
  showInsights?: boolean
}

const SLADelaySummaryPanel: React.FC<SLADelaySummaryPanelProps> = ({
  data = slaDelayData.summary,
  showInsights = true
}) => {
  // Calculate additional metrics
  const errorRate = data.errorPercentage
  const maxDelay = data.maxDelay
  const avgDelay = slaDelayData.delayRows.reduce((sum, row) => sum + row.delayDays, 0) / slaDelayData.delayRows.length

  // Get status information based on error rate and delay
  const getDelayStatus = (errorPercentage: number, maxDelayDays: number) => {
    if (errorPercentage >= SLA_THRESHOLDS.ERROR_PERCENTAGE.CRITICAL || maxDelayDays >= SLA_THRESHOLDS.DELAY_DAYS.CRITICAL) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
        icon: <AlertTriangle className="w-5 h-5" />,
        status: 'Critical',
        trend: 'critical'
      }
    } else if (errorPercentage >= SLA_THRESHOLDS.ERROR_PERCENTAGE.WARNING || maxDelayDays >= SLA_THRESHOLDS.DELAY_DAYS.WARNING) {
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30',
        icon: <Clock className="w-5 h-5" />,
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

  const delayStatus = getDelayStatus(errorRate, maxDelay)

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
      color: delayStatus.color,
      bgColor: delayStatus.bgColor,
      trend: 'up',
      description: 'Settlement delays identified'
    },
    {
      label: 'Error Percentage',
      value: formatPercentageValue(data.errorPercentage),
      icon: <Percent className="w-5 h-5" />,
      color: delayStatus.color,
      bgColor: delayStatus.bgColor,
      trend: 'up',
      description: `${delayStatus.status} SLA breach rate`
    },
    {
      label: 'Max Delay',
      value: `${data.maxDelay} Days`,
      icon: <Timer className="w-5 h-5" />,
      color: delayStatus.color,
      bgColor: delayStatus.bgColor,
      trend: 'up',
      description: 'Longest settlement delay'
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
            <Clock className="w-6 h-6 text-red-400" />
            SLA Delay Summary
          </h3>
          <p className="text-white/60 mt-1">
            Settlement timing analysis and SLA compliance monitoring
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">SLA Target</div>
          <div className="text-white font-medium">T+1 Settlement</div>
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
                  {metric.trend === 'up' && (
                    <TrendingUp className="w-3 h-3 text-red-400" />
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
            
            {/* Critical indicator for max delay */}
            {metric.label === 'Max Delay' && maxDelay >= SLA_THRESHOLDS.DELAY_DAYS.CRITICAL && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            )}
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
        ))}
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Avg Delay</span>
          </div>
          <div className="text-purple-300 text-xl font-bold">{avgDelay.toFixed(1)} days</div>
          <div className="text-purple-200 text-xs">Across all delayed transactions</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">SLA Breaches</span>
          </div>
          <div className="text-yellow-300 text-xl font-bold">{data.transactionErrors}</div>
          <div className="text-yellow-200 text-xs">Transactions beyond T+1</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">On-time Rate</span>
          </div>
          <div className="text-green-300 text-xl font-bold">{(100 - errorRate).toFixed(1)}%</div>
          <div className="text-green-200 text-xs">Settlements within SLA</div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Critical Delays</span>
          </div>
          <div className="text-red-300 text-xl font-bold">
            {slaDelayData.delayRows.filter(row => row.delayDays >= SLA_THRESHOLDS.DELAY_DAYS.CRITICAL).length}
          </div>
          <div className="text-red-200 text-xs">≥7 days delay</div>
        </div>
      </div>

      {/* SLA Performance Indicators */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          SLA Performance Thresholds
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white/70">≤ {SLA_THRESHOLDS.DELAY_DAYS.GOOD} days (On-time)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-white/70">≤ {SLA_THRESHOLDS.DELAY_DAYS.WARNING} days (Acceptable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-white/70">≥ {SLA_THRESHOLDS.DELAY_DAYS.CRITICAL} days (Critical)</span>
          </div>
        </div>
      </div>

      {/* Status and Insights */}
      {showInsights && (
        <div className="space-y-3">
          {/* SLA Status */}
          <div className={`${delayStatus.bgColor} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              {delayStatus.icon}
              <span className={`${delayStatus.color} text-sm font-medium`}>
                SLA Performance Status: {delayStatus.status}
              </span>
            </div>
            <p className={`${delayStatus.color} text-sm`}>
              {errorRate >= SLA_THRESHOLDS.ERROR_PERCENTAGE.CRITICAL
                ? `Critical SLA breach rate of ${errorRate}% with maximum delay of ${maxDelay} days requires immediate intervention.`
                : errorRate >= SLA_THRESHOLDS.ERROR_PERCENTAGE.WARNING
                ? `High SLA breach rate of ${errorRate}% indicates systematic settlement delays affecting customer experience.`
                : `SLA performance at ${errorRate}% breach rate is within acceptable limits but requires monitoring.`
              }
            </p>
          </div>

          {/* Settlement Impact */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Settlement Impact</span>
            </div>
            <p className="text-orange-300 text-sm">
              {data.transactionErrors} transactions experiencing delays beyond T+1 settlement target. 
              Maximum delay of {maxDelay} days significantly impacts cash flow and customer satisfaction.
            </p>
          </div>

          {/* Performance Trends */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Performance Analysis</span>
            </div>
            <p className="text-blue-300 text-sm">
              Average delay of {avgDelay.toFixed(1)} days across delayed transactions. 
              {(100 - errorRate).toFixed(1)}% of transactions settle on-time, indicating room for process optimization.
            </p>
          </div>

          {/* Action Items */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Recommended Actions</span>
            </div>
            <ul className="text-red-300 text-sm space-y-1">
              <li>• Investigate root causes of {data.transactionErrors} delayed settlements</li>
              <li>• Implement automated monitoring for transactions exceeding T+1 target</li>
              <li>• Establish escalation procedures for delays ≥{SLA_THRESHOLDS.DELAY_DAYS.WARNING} days</li>
              <li>• Review acquirer performance and settlement processes</li>
              <li>• Set up real-time alerts for critical delays (≥{SLA_THRESHOLDS.DELAY_DAYS.CRITICAL} days)</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SLADelaySummaryPanel