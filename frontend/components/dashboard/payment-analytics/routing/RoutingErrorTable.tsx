'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CreditCard, Building2, DollarSign } from 'lucide-react'

import { routingNonComplianceData } from '../data'
import { ANIMATION_VARIANTS } from '../constants'

const RoutingErrorTable: React.FC = () => {
  const { routingErrors } = routingNonComplianceData

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
        Routing Error Transactions
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
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
            {routingErrors.map((row, index) => (
              <motion.tr
                key={row.txnId}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-medium text-sm">{row.txnId}</span>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${row.network === 'VISA' ? 'bg-blue-500/20 text-blue-300' :
                      row.network === 'MC' ? 'bg-red-500/20 text-red-300' :
                      row.network === 'RuPay' ? 'bg-green-500/20 text-green-300' :
                      'bg-purple-500/20 text-purple-300'}
                  `}>
                    {row.network}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-white/80 text-sm">{row.cardType}</td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm">{row.preferredAcquirer}</span>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-sm">{row.actualAcquirer}</span>
                  </div>
                </td>
                
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 font-medium text-sm">₹{row.costImpact}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-red-400 text-sm font-medium">Total Routing Errors</div>
            <div className="text-red-300 text-xl font-bold">{routingErrors.length}</div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-yellow-400 text-sm font-medium">Total Cost Impact</div>
            <div className="text-yellow-300 text-xl font-bold">
              ₹{routingErrors.reduce((sum, row) => sum + row.costImpact, 0)}
            </div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-orange-400 text-sm font-medium">Avg Cost per Error</div>
            <div className="text-orange-300 text-xl font-bold">
              ₹{Math.round(routingErrors.reduce((sum, row) => sum + row.costImpact, 0) / routingErrors.length)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RoutingErrorTable"