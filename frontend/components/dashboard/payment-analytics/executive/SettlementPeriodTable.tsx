'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

import { SettlementPeriod } from '../types'
import { executiveDashboardData } from '../data'
import { SLA_THRESHOLDS, ANIMATION_VARIANTS } from '../constants'

interface SettlementPeriodTableProps {
  data?: SettlementPeriod[]
  showInsights?: boolean
}

const SettlementPeriodTable: React.FC<SettlementPeriodTableProps> = ({
  data = executiveDashboardData.settlementPeriods,
  showInsights = true
}) => {
  // Calculate statistics
  const avgSettlementTime = data.reduce((sum, item) => sum + item.avgDays, 0) / data.length
  const warningCount = data.filter(item => item.isWarning).length
  const bestPerformer = data.reduce((best, current) => 
    current.avgDays < best.avgDays ? current : best
  )
  const worstPerformer = data.reduce((worst, current) => 
    current.avgDays > worst.avgDays ? current : worst
  )

  // Get status color and icon based on settlement days
  const getStatusInfo = (avgDays: number, isWarning: boolean) => {
    if (isWarning || avgDays > SLA_THRESHOLDS.SETTLEMENT_DAYS.WARNING) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
        icon: <AlertTriangle className="w-4 h-4" />,
        status: 'Warning',
        trend: avgDays > SLA_THRESHOLDS.SETTLEMENT_DAYS.CRITICAL ? 'critical' : 'warning'
      }
    } else if (avgDays > SLA_THRESHOLDS.SETTLEMENT_DAYS.GOOD) {
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/30',
        icon: <Clock className="w-4 h-4" />,
        status: 'Moderate',
        trend: 'moderate'
      }
    } else {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30',
        icon: <CheckCircle className="w-4 h-4" />,
        status: 'Good',
        trend: 'good'
      }
    }
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Average Settlement Period (Days)
        </h3>
        <div className="text-right">
          <div className="text-sm text-white/60">Overall Average</div>
          <div className="text-white font-bold">{avgSettlementTime.toFixed(1)} days</div>
        </div>
      </div>

      {/* Settlement Period Table */}
      <div className="space-y-3 mb-6">
        {data.map((period, index) => {
          const statusInfo = getStatusInfo(period.avgDays, period.isWarning)
          
          return (
            <motion.div
              key={period.acquirer}
              className={`
                flex items-center justify-between p-4 rounded-lg border
                ${statusInfo.bgColor}
                hover:bg-opacity-80 transition-all duration-300
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Acquirer Info */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/20 ${statusInfo.color}`}>
                  {statusInfo.icon}
                </div>
                <div>
                  <div className="text-white font-medium text-lg">{period.acquirer}</div>
                  <div className={`text-sm ${statusInfo.color}`}>{statusInfo.status}</div>
                </div>
              </div>

              {/* Settlement Time */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${statusInfo.color} flex items-center gap-2`}>
                  {period.avgDays} days
                  {period.isWarning && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-white/60 text-sm">
                  {period.avgDays <= SLA_THRESHOLDS.SETTLEMENT_DAYS.GOOD ? 'Within SLA' : 'Above SLA'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Best Performer</span>
          </div>
          <div className="text-green-300 text-lg font-bold">{bestPerformer.acquirer}</div>
          <div className="text-green-200 text-sm">{bestPerformer.avgDays} days</div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Needs Attention</span>
          </div>
          <div className="text-red-300 text-lg font-bold">{worstPerformer.acquirer}</div>
          <div className="text-red-200 text-sm">{worstPerformer.avgDays} days</div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">SLA Compliance</span>
          </div>
          <div className="text-blue-300 text-lg font-bold">
            {((data.length - warningCount) / data.length * 100).toFixed(0)}%
          </div>
          <div className="text-blue-200 text-sm">{data.length - warningCount}/{data.length} acquirers</div>
        </div>
      </div>

      {/* SLA Thresholds Reference */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          SLA Thresholds
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white/70">≤ {SLA_THRESHOLDS.SETTLEMENT_DAYS.GOOD} days (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-white/70">≤ {SLA_THRESHOLDS.SETTLEMENT_DAYS.WARNING} days (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-white/70">&gt; {SLA_THRESHOLDS.SETTLEMENT_DAYS.WARNING} days (Warning)</span>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      {showInsights && (
        <div className="space-y-3">
          {warningCount > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Performance Alert</span>
              </div>
              <p className="text-yellow-300 text-sm">
                {warningCount} acquirer{warningCount > 1 ? 's' : ''} showing higher settlement periods. 
                Monitor for SLA compliance and consider process optimization.
              </p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Optimization Opportunity</span>
            </div>
            <p className="text-blue-300 text-sm">
              {bestPerformer.acquirer} demonstrates best-in-class settlement times. 
              Consider adopting similar processes across other acquirers.
            </p>
          </div>

          {avgSettlementTime > SLA_THRESHOLDS.SETTLEMENT_DAYS.WARNING && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Action Required</span>
              </div>
              <p className="text-red-300 text-sm">
                Overall average settlement time ({avgSettlementTime.toFixed(1)} days) exceeds recommended thresholds. 
                Immediate process review recommended.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default SettlementPeriodTable