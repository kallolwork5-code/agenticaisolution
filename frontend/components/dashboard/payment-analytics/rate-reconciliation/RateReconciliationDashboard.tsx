'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Calculator, FileText } from 'lucide-react'

import { rateReconciliationData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'
import ReconciliationSummaryPanel from './ReconciliationSummaryPanel'
import ReconciliationTable from './ReconciliationTable'

const RateReconciliationDashboard: React.FC = () => {
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
            <AlertTriangle className="w-7 h-7 text-orange-400" />
            Rate Reconciliation
          </h2>
          <p className="text-white/60 mt-1">
            Contractual non-compliance analysis and MDR rate discrepancy identification
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">Last Updated</div>
          <div className="text-white/60">{new Date().toLocaleString()}</div>
        </div>
      </motion.div>

      {/* Summary Panel */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <ReconciliationSummaryPanel />
      </motion.div>

      {/* Reconciliation Table */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <ReconciliationTable />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="text-orange-400 text-sm font-medium">Critical Errors</div>
          <div className="text-orange-300 text-2xl font-bold">
            {rateReconciliationData.reconciliationRows.filter(row => row.saving > 1000).length}
          </div>
          <div className="text-orange-200 text-xs">High-value discrepancies</div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-400 text-sm font-medium">Axis Bank Errors</div>
          <div className="text-red-300 text-2xl font-bold">
            {rateReconciliationData.reconciliationRows.filter(row => row.acquirer === 'Axis').length}
          </div>
          <div className="text-red-200 text-xs">Highest error count</div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-sm font-medium">Avg Saving/Error</div>
          <div className="text-blue-300 text-2xl font-bold">
            ₹{Math.round(rateReconciliationData.reconciliationRows.reduce((sum, row) => sum + row.saving, 0) / rateReconciliationData.reconciliationRows.length)}
          </div>
          <div className="text-blue-200 text-xs">Per transaction</div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-sm font-medium">Recovery Rate</div>
          <div className="text-green-300 text-2xl font-bold">85%</div>
          <div className="text-green-200 text-xs">Expected recovery</div>
        </div>
      </motion.div>

      {/* Error Distribution by Acquirer */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.8 }}
        className="bg-white/5 rounded-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Error Distribution by Acquirer</h3>
        <div className="space-y-3">
          {['Axis', 'ICICI', 'SBI'].map((acquirer) => {
            const errors = rateReconciliationData.reconciliationRows.filter(row => row.acquirer === acquirer)
            const totalSavings = errors.reduce((sum, row) => sum + row.saving, 0)
            const percentage = (errors.length / rateReconciliationData.reconciliationRows.length) * 100
            
            return (
              <div key={acquirer} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                  <span className="text-white font-medium">{acquirer}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{errors.length} errors</div>
                  <div className="text-white/60 text-sm">₹{totalSavings.toLocaleString()} savings</div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default RateReconciliationDashboard