'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Route, AlertTriangle, Timer } from 'lucide-react'

import { routingNonComplianceData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'

const RoutingNonComplianceDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Route className="w-7 h-7 text-orange-400" />
            Routing Non-Compliance Analysis
          </h2>
          <p className="text-white/60 mt-1">
            Transaction routing optimization and compliance monitoring
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">Last Updated</div>
          <div className="text-white/60">{new Date().toLocaleString()}</div>
        </div>
      </motion.div>

      {/* KPI Summary */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Routing Performance KPIs</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-medium">Total Transactions</div>
            <div className="text-blue-300 text-2xl font-bold">{routingNonComplianceData.kpis.totalTransactions}</div>
            <div className="text-blue-200 text-xs">Processed transactions</div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="text-orange-400 text-sm font-medium">Incorrect Routing</div>
            <div className="text-orange-300 text-2xl font-bold">{routingNonComplianceData.kpis.incorrectRouting}</div>
            <div className="text-orange-200 text-xs">Routing errors identified</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Routing Error %</div>
            <div className="text-red-300 text-2xl font-bold">{routingNonComplianceData.kpis.routingErrorPercentage}%</div>
            <div className="text-red-200 text-xs">Error rate</div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 text-sm font-medium">Cost Impact</div>
            <div className="text-yellow-300 text-2xl font-bold">{routingNonComplianceData.kpis.estimatedCostImpact}</div>
            <div className="text-yellow-200 text-xs">Estimated impact</div>
          </div>
        </div>
      </motion.div>

      {/* Routing Error Table Preview */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Routing Error Transactions
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Txn ID</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Network</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Card Type</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Preferred Acquirer</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Actual Acquirer</th>
                <th className="px-4 py-3 text-right text-white/80 font-medium text-sm">Cost Impact (INR)</th>
              </tr>
            </thead>
            <tbody>
              {routingNonComplianceData.routingErrors.slice(0, 5).map((row, index) => (
                <tr key={row.txnId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-blue-300 font-medium text-sm">{row.txnId}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.network}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.cardType}</td>
                  <td className="px-4 py-3 text-green-300 text-sm">{row.preferredAcquirer}</td>
                  <td className="px-4 py-3 text-red-300 text-sm">{row.actualAcquirer}</td>
                  <td className="px-4 py-3 text-right text-yellow-300 font-medium text-sm">₹{row.costImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Showing {Math.min(5, routingNonComplianceData.routingErrors.length)} of {routingNonComplianceData.routingErrors.length} routing errors
          </p>
        </div>
      </motion.div>

      {/* Implementation Notice */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 text-sm font-medium">Implementation Status</span>
        </div>
        <p className="text-orange-300 text-sm">
          Routing Non-Compliance dashboard is showing preview data. Full implementation with detailed 
          routing analysis, KPI components, and error table will be completed in upcoming tasks.
        </p>
      </motion.div>
    </div>
  )
}

export default RoutingNonComplianceDashboard