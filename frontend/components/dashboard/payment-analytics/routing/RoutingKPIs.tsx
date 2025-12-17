'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Route, AlertTriangle, DollarSign, Percent } from 'lucide-react'

import { routingNonComplianceData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'

const RoutingKPIs: React.FC = () => {
  const { kpis } = routingNonComplianceData

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <Route className="w-6 h-6 text-orange-400" />
        Routing Performance KPIs
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Total Transactions</span>
          </div>
          <div className="text-blue-300 text-2xl font-bold">{kpis.totalTransactions}</div>
          <div className="text-blue-200 text-xs">Processed transactions</div>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Incorrect Routing</span>
          </div>
          <div className="text-orange-300 text-2xl font-bold">{kpis.incorrectRouting}</div>
          <div className="text-orange-200 text-xs">Routing errors identified</div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Routing Error %</span>
          </div>
          <div className="text-red-300 text-2xl font-bold">{kpis.routingErrorPercentage}%</div>
          <div className="text-red-200 text-xs">Error rate</div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">Cost Impact</span>
          </div>
          <div className="text-yellow-300 text-2xl font-bold">{kpis.estimatedCostImpact}</div>
          <div className="text-yellow-200 text-xs">Estimated impact</div>
        </div>
      </div>
    </motion.div>
  )
}

export default RoutingKPIs"