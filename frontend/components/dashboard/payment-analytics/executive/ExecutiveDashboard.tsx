'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

import { KPITile } from '../types'
import { executiveDashboardData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'
import KPITiles from './KPITiles'

// Import chart components
import AcquirerCollectionChart from './AcquirerCollectionChart'
import NetworkSplitChart from './NetworkSplitChart'
import CardTypeChart from './CardTypeChart'
import OnUsOffUsChart from './OnUsOffUsChart'
import SettlementPeriodTable from './SettlementPeriodTable'



const ExecutiveDashboard: React.FC = () => {
  // Convert executive dashboard data to KPI tiles format
  const kpiTiles: KPITile[] = [
    {
      label: 'Total Collection',
      value: executiveDashboardData.kpis.totalCollection,
      format: 'currency',
      trend: 'up'
    },
    {
      label: 'Total MDR Cost',
      value: executiveDashboardData.kpis.totalMDRCost,
      format: 'currency',
      trend: 'neutral'
    },
    {
      label: 'MDR Cost %',
      value: executiveDashboardData.kpis.mdrCostPercentage,
      format: 'percentage',
      trend: 'down'
    },
    {
      label: 'No. of Acquirers',
      value: executiveDashboardData.kpis.numberOfAcquirers.toString(),
      format: 'number'
    },
    {
      label: 'Time Range',
      value: executiveDashboardData.kpis.timeRange,
      format: 'text'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            Executive Dashboard
          </h2>
          <p className="text-white/60 mt-1">
            High-level KPIs and collection metrics for payment operations overview
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/40">Last Updated</div>
          <div className="text-white/60">{new Date().toLocaleString()}</div>
        </div>
      </motion.div>

      {/* KPI Tiles */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <KPITiles tiles={kpiTiles} />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquirer Collection Chart */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Acquirer-wise Collection (₹ Cr)
            </h3>
            <AcquirerCollectionChart />
          </div>
        </motion.div>

        {/* Network Split Chart */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Network-wise Split (%)
            </h3>
            <NetworkSplitChart />
          </div>
        </motion.div>

        {/* Card Type Chart */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Card Type Classification (%)
            </h3>
            <CardTypeChart />
          </div>
        </motion.div>

        {/* On-us/Off-us Chart */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              On-us / Off-us Bifurcation (%)
            </h3>
            <OnUsOffUsChart />
          </div>
        </motion.div>
      </div>

      {/* Settlement Period Table */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.8 }}
      >
        <SettlementPeriodTable />
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.9 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-sm font-medium">Collection Efficiency</div>
          <div className="text-blue-300 text-2xl font-bold">98.5%</div>
          <div className="text-blue-200 text-xs">Above industry average</div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-sm font-medium">Processing Success</div>
          <div className="text-green-300 text-2xl font-bold">99.2%</div>
          <div className="text-green-200 text-xs">Excellent performance</div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-400 text-sm font-medium">Network Diversity</div>
          <div className="text-purple-300 text-2xl font-bold">4 Networks</div>
          <div className="text-purple-200 text-xs">Well distributed</div>
        </div>
      </motion.div>
    </div>
  )
}

export default ExecutiveDashboard