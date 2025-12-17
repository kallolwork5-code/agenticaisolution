'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle, Timer } from 'lucide-react'

import { slaDelayData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'
import SLADelaySummaryPanel from './SLADelaySummaryPanel'
import SLADelayTable from './SLADelayTable'

const SLADelayDashboard: React.FC = () => {
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
            <Clock className="w-7 h-7 text-red-400" />
            SLA Delay Analysis
          </h2>
          <p className="text-white/60 mt-1">
            Settlement timing monitoring and SLA compliance tracking
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
        <SLADelaySummaryPanel />
      </motion.div>

      {/* SLA Delay Table */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <SLADelayTable />
      </motion.div>

      {/* Delay Distribution Stats */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-400 text-sm font-medium">7+ Day Delays</div>
          <div className="text-red-300 text-2xl font-bold">
            {slaDelayData.delayRows.filter(row => row.delayDays >= 7).length}
          </div>
          <div className="text-red-200 text-xs">Critical delays</div>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="text-orange-400 text-sm font-medium">5-6 Day Delays</div>
          <div className="text-orange-300 text-2xl font-bold">
            {slaDelayData.delayRows.filter(row => row.delayDays >= 5 && row.delayDays < 7).length}
          </div>
          <div className="text-orange-200 text-xs">High delays</div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-sm font-medium">3-4 Day Delays</div>
          <div className="text-yellow-300 text-2xl font-bold">
            {slaDelayData.delayRows.filter(row => row.delayDays >= 3 && row.delayDays < 5).length}
          </div>
          <div className="text-yellow-200 text-xs">Moderate delays</div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-sm font-medium">Avg Delay Impact</div>
          <div className="text-blue-300 text-2xl font-bold">
            ₹{Math.round(slaDelayData.delayRows.reduce((sum, row) => sum + row.transAmount, 0) / slaDelayData.delayRows.length / 1000)}K
          </div>
          <div className="text-blue-200 text-xs">Per delayed transaction</div>
        </div>
      </motion.div>

      {/* Acquirer Performance Analysis */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.8 }}
        className="bg-white/5 rounded-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Acquirer Settlement Performance</h3>
        <div className="space-y-3">
          {['Axis', 'SBI', 'ICICI'].map((acquirer) => {
            const delays = slaDelayData.delayRows.filter(row => row.acquirer === acquirer)
            const avgDelay = delays.length > 0 
              ? delays.reduce((sum, row) => sum + row.delayDays, 0) / delays.length 
              : 0
            const totalAmount = delays.reduce((sum, row) => sum + row.transAmount, 0)
            
            return (
              <div key={acquirer} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    avgDelay >= 7 ? 'bg-red-400' : 
                    avgDelay >= 5 ? 'bg-orange-400' : 
                    avgDelay >= 3 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className="text-white font-medium">{acquirer}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{delays.length} delays</div>
                  <div className="text-white/60 text-sm">
                    {avgDelay > 0 ? `${avgDelay.toFixed(1)} avg days` : 'No delays'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Settlement Timeline Analysis */}
      <motion.div
        variants={ANIMATION_VARIANTS.fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: 1.0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Delay Severity Distribution */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Delay Severity Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Critical (≥7 days)', count: slaDelayData.delayRows.filter(r => r.delayDays >= 7).length, color: 'bg-red-400' },
              { label: 'High (5-6 days)', count: slaDelayData.delayRows.filter(r => r.delayDays >= 5 && r.delayDays < 7).length, color: 'bg-orange-400' },
              { label: 'Medium (3-4 days)', count: slaDelayData.delayRows.filter(r => r.delayDays >= 3 && r.delayDays < 5).length, color: 'bg-yellow-400' },
            ].map((item, index) => {
              const percentage = (item.count / slaDelayData.delayRows.length) * 100
              return (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-white/80 text-sm">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{item.count}</span>
                    <span className="text-white/60 text-sm ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Business Impact */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-400" />
            Business Impact Analysis
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-red-400 text-sm font-medium">Cash Flow Impact</div>
              <div className="text-red-300 text-lg font-bold">
                ₹{(slaDelayData.delayRows.reduce((sum, row) => sum + row.transAmount, 0) / 10000000).toFixed(1)} Cr
              </div>
              <div className="text-red-200 text-xs">Delayed settlement value</div>
            </div>
            
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="text-orange-400 text-sm font-medium">Customer Impact</div>
              <div className="text-orange-300 text-lg font-bold">High</div>
              <div className="text-orange-200 text-xs">Service level degradation</div>
            </div>
            
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="text-yellow-400 text-sm font-medium">Operational Risk</div>
              <div className="text-yellow-300 text-lg font-bold">Elevated</div>
              <div className="text-yellow-200 text-xs">Process optimization needed</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SLADelayDashboard