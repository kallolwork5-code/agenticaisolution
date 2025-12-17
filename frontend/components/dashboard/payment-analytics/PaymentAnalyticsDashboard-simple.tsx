'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Clock, AlertTriangle, Route } from 'lucide-react'

import { PaymentAnalyticsDashboardProps } from './types'
import { DASHBOARD_TABS } from './constants'
import { slaDelayData } from './data'

// Import chart components
import ChartContainer from '../../charts/ChartContainer'
import InteractiveBarChart from '../../charts/InteractiveBarChart'
import InteractivePieChart from '../../charts/InteractivePieChart'
import { BarChartData, PieChartData } from '@/lib/chart-types'

// Simple dashboard navigation
const SimpleDashboardNavigation: React.FC<{
  activeTab: string
  onTabChange: (tabId: string) => void
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'executive', name: 'Executive Dashboard', icon: BarChart3 },
    { id: 'rate-reconciliation', name: 'Rate Reconciliation', icon: AlertTriangle },
    { id: 'sla-delay', name: 'SLA Delay', icon: Clock },
    { id: 'routing-compliance', name: 'Routing Non-Compliance', icon: Route }
  ]

  return (
    <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-8" aria-label="Dashboard navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            
            // Get theme color based on tab
            const getTabTheme = (tabId: string) => {
              switch (tabId) {
                case 'executive':
                  return 'text-blue-400 border-blue-400 bg-blue-500/10'
                case 'rate-reconciliation':
                  return 'text-orange-400 border-orange-400 bg-orange-500/10'
                case 'sla-delay':
                  return 'text-red-400 border-red-400 bg-red-500/10'
                case 'routing-compliance':
                  return 'text-purple-400 border-purple-400 bg-purple-500/10'
                default:
                  return 'text-blue-400 border-blue-400 bg-blue-500/10'
              }
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm
                  transition-all duration-200
                  ${isActive 
                    ? getTabTheme(tab.id)
                    : 'text-white/60 border-transparent hover:text-white hover:border-white/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// Simple SLA Delay Dashboard
const SimpleSLADelayDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-red-400" />
            SLA Delay Analysis
          </h2>
          <p className="text-white/60 mt-1">
            Settlement timing monitoring and SLA compliance tracking
          </p>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">SLA Delay Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-medium">Total Collection</div>
            <div className="text-blue-300 text-2xl font-bold">{slaDelayData.summary.totalCollection}</div>
            <div className="text-blue-200 text-xs">Total transaction volume</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Transaction Errors</div>
            <div className="text-red-300 text-2xl font-bold">{slaDelayData.summary.transactionErrors}</div>
            <div className="text-red-200 text-xs">Settlement delays identified</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Error Percentage</div>
            <div className="text-red-300 text-2xl font-bold">{slaDelayData.summary.errorPercentage}%</div>
            <div className="text-red-200 text-xs">Critical SLA breach rate</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Max Delay</div>
            <div className="text-red-300 text-2xl font-bold">{slaDelayData.summary.maxDelay} Days</div>
            <div className="text-red-200 text-xs">Longest settlement delay</div>
          </div>
        </div>
      </div>

      {/* Simple Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">SLA Delay Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Unique ID</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Acquirer</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Network</th>
                <th className="px-4 py-3 text-right text-white/80 font-medium text-sm">Amount</th>
                <th className="px-4 py-3 text-center text-white/80 font-medium text-sm">Delay (Days)</th>
              </tr>
            </thead>
            <tbody>
              {slaDelayData.delayRows.slice(0, 5).map((row, index) => (
                <tr key={row.uniqueId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-blue-300 font-medium text-sm">{row.uniqueId}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.acquirer}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.network}</td>
                  <td className="px-4 py-3 text-right text-green-300 font-medium text-sm">
                    ₹{row.transAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${row.delayDays >= 7 ? 'bg-red-500/20 text-red-300' :
                        row.delayDays >= 5 ? 'bg-orange-500/20 text-orange-300' :
                        'bg-yellow-500/20 text-yellow-300'}
                    `}>
                      {row.delayDays} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Showing 5 of {slaDelayData.delayRows.length} delayed transactions
          </p>
        </div>
      </div>
    </div>
  )
}

// Executive Dashboard Implementation
const SimpleExecutiveDashboard: React.FC = () => {
  const { executiveDashboardData } = require('./data')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            Executive Dashboard
          </h2>
          <p className="text-white/60 mt-1">
            High-level KPIs and collection metrics overview
          </p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-400 text-sm font-medium">Total Collection</div>
          <div className="text-blue-300 text-2xl font-bold">₹2,421 Cr</div>
          <div className="text-blue-200 text-xs">01 Jan - 31 Mar 2024</div>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-green-400 text-sm font-medium">Total MDR Cost</div>
          <div className="text-green-300 text-2xl font-bold">₹51.2 Cr</div>
          <div className="text-green-200 text-xs">Processing costs</div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-yellow-400 text-sm font-medium">MDR Cost %</div>
          <div className="text-yellow-300 text-2xl font-bold">2.11%</div>
          <div className="text-yellow-200 text-xs">Cost percentage</div>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-400 text-sm font-medium">No. of Acquirers</div>
          <div className="text-purple-300 text-2xl font-bold">4</div>
          <div className="text-purple-200 text-xs">Active acquirers</div>
        </div>
        
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <div className="text-indigo-400 text-sm font-medium">Time Range</div>
          <div className="text-indigo-300 text-lg font-bold">Q1 2024</div>
          <div className="text-indigo-200 text-xs">Reporting period</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Acquirer Collection Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ChartContainer title="Acquirer-wise Collection (in ₹ Cr)">
            <InteractiveBarChart 
              data={[
                { name: 'HDFC', value: 1020, fill: '#3B82F6' },
                { name: 'ICICI', value: 740, fill: '#10B981' },
                { name: 'Axis', value: 430, fill: '#F59E0B' },
                { name: 'SBI', value: 231, fill: '#EF4444' }
              ]}
              title="Acquirer Performance"
              height={250}
              color="#3B82F6"
            />
          </ChartContainer>
        </motion.div>

        {/* Network Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ChartContainer title="Network-wise Split (in %)">
            <InteractivePieChart 
              data={[
                { name: 'VISA', value: 48, fill: '#1E40AF' },
                { name: 'Mastercard', value: 32, fill: '#DC2626' },
                { name: 'RuPay', value: 15, fill: '#059669' },
                { name: 'Amex', value: 5, fill: '#7C3AED' }
              ]}
              title="Network Distribution"
              height={250}
            />
          </ChartContainer>
        </motion.div>

        {/* Card Type Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ChartContainer title="Card Type Classification">
            <InteractivePieChart 
              data={[
                { name: 'Credit', value: 72, fill: '#3B82F6' },
                { name: 'Debit', value: 28, fill: '#10B981' }
              ]}
              title="Card Types"
              height={250}
            />
          </ChartContainer>
        </motion.div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Settlement Period Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ChartContainer title="Average Settlement Period (in Days)">
            <InteractiveBarChart 
              data={[
                { name: 'HDFC', value: 1.8, fill: '#10B981' },
                { name: 'ICICI', value: 2.4, fill: '#34D399' },
                { name: 'Axis', value: 3.1, fill: '#F59E0B' },
                { name: 'SBI', value: 2.9, fill: '#EF4444' }
              ]}
              title="Settlement Period"
              height={250}
              color="#10B981"
            />
          </ChartContainer>
        </motion.div>

        {/* On-us vs Off-us Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <ChartContainer title="On-us vs Off-us Bifurcation">
            <InteractivePieChart 
              data={[
                { name: 'On-us', value: 61, fill: '#3B82F6' },
                { name: 'Off-us', value: 39, fill: '#10B981' }
              ]}
              title="Transaction Routing"
              height={250}
            />
          </ChartContainer>
        </motion.div>

        {/* MDR Cost Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <ChartContainer title="MDR Cost Breakdown (in ₹ Cr)">
            <InteractiveBarChart 
              data={[
                { name: 'HDFC', value: 21.6, fill: '#3B82F6' },
                { name: 'ICICI', value: 15.6, fill: '#10B981' },
                { name: 'Axis', value: 9.1, fill: '#F59E0B' },
                { name: 'SBI', value: 4.9, fill: '#EF4444' }
              ]}
              title="MDR Costs by Acquirer"
              height={250}
              color="#8B5CF6"
            />
          </ChartContainer>
        </motion.div>
      </div>

      {/* Settlement Period Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Average Settlement Period</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Acquirer</th>
                <th className="px-4 py-3 text-center text-white/80 font-medium text-sm">Avg Days</th>
                <th className="px-4 py-3 text-center text-white/80 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { acquirer: 'HDFC', avgDays: 1.8, isWarning: false },
                { acquirer: 'ICICI', avgDays: 2.4, isWarning: false },
                { acquirer: 'Axis', avgDays: 3.1, isWarning: true },
                { acquirer: 'SBI', avgDays: 2.9, isWarning: true }
              ].map((row) => (
                <tr key={row.acquirer} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white/80 text-sm">{row.acquirer}</td>
                  <td className="px-4 py-3 text-center text-white font-medium text-sm">{row.avgDays}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${row.isWarning ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}
                    `}>
                      {row.isWarning ? 'Warning' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Rate Reconciliation Dashboard Implementation
const SimpleRateReconciliationDashboard: React.FC = () => {
  const { rateReconciliationData } = require('./data')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-orange-400" />
            Rate Reconciliation Analysis
          </h2>
          <p className="text-white/60 mt-1">
            Rate reconciliation errors and potential savings identification
          </p>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Rate Reconciliation Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-medium">Total Collection</div>
            <div className="text-blue-300 text-2xl font-bold">₹2,421 Cr</div>
            <div className="text-blue-200 text-xs">Total transaction volume</div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="text-orange-400 text-sm font-medium">Transaction Errors</div>
            <div className="text-orange-300 text-2xl font-bold">150</div>
            <div className="text-orange-200 text-xs">Rate discrepancies found</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Error Percentage</div>
            <div className="text-red-300 text-2xl font-bold">29.5%</div>
            <div className="text-red-200 text-xs">Rate compliance issues</div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-400 text-sm font-medium">Saving Amount</div>
            <div className="text-green-300 text-2xl font-bold">₹25.6 Cr</div>
            <div className="text-green-200 text-xs">Potential savings identified</div>
          </div>
        </div>
      </div>

      {/* Charts Grid for Rate Reconciliation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Error Distribution by Acquirer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ChartContainer title="Errors by Acquirer">
            <InteractiveBarChart 
              data={[
                { name: 'Axis', value: 4, fill: '#F59E0B' },
                { name: 'ICICI', value: 2, fill: '#10B981' },
                { name: 'SBI', value: 2, fill: '#EF4444' }
              ]}
              title="Rate Reconciliation Errors"
              height={250}
              color="#F59E0B"
            />
          </ChartContainer>
        </motion.div>

        {/* Savings Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ChartContainer title="Savings by Network">
            <InteractivePieChart 
              data={[
                { name: 'VISA', value: 45, fill: '#1E40AF' },
                { name: 'MC', value: 35, fill: '#DC2626' },
                { name: 'RuPay', value: 20, fill: '#059669' }
              ]}
              title="Savings Distribution"
              height={250}
            />
          </ChartContainer>
        </motion.div>

        {/* MDR Rate Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ChartContainer title="Applied vs Agreed MDR">
            <InteractiveBarChart 
              data={[
                { name: 'Applied', value: 2.4, fill: '#EF4444' },
                { name: 'Agreed', value: 1.9, fill: '#10B981' }
              ]}
              title="Average MDR Rates"
              height={250}
              color="#EF4444"
            />
          </ChartContainer>
        </motion.div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Rate Reconciliation Errors</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Unique ID</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Acquirer</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Network</th>
                <th className="px-4 py-3 text-right text-white/80 font-medium text-sm">Amount</th>
                <th className="px-4 py-3 text-center text-white/80 font-medium text-sm">Applied MDR</th>
                <th className="px-4 py-3 text-center text-white/80 font-medium text-sm">Agreed MDR</th>
                <th className="px-4 py-3 text-right text-white/80 font-medium text-sm">Saving</th>
              </tr>
            </thead>
            <tbody>
              {rateReconciliationData.reconciliationRows.slice(0, 5).map((row: any) => (
                <tr key={row.uniqueId} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-blue-300 font-medium text-sm">{row.uniqueId}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.acquirer}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{row.network}</td>
                  <td className="px-4 py-3 text-right text-white font-medium text-sm">
                    ₹{row.transAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center text-red-300 text-sm">{row.appliedMDR}%</td>
                  <td className="px-4 py-3 text-center text-green-300 text-sm">{row.agreedMDR}%</td>
                  <td className="px-4 py-3 text-right text-green-300 font-medium text-sm">
                    ₹{row.saving.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Showing 5 of {rateReconciliationData.reconciliationRows.length} reconciliation errors
          </p>
        </div>
      </div>
    </div>
  )
}

// Routing Non-Compliance Dashboard Implementation
const SimpleRoutingNonComplianceDashboard: React.FC = () => {
  const { routingNonComplianceData } = require('./data')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Route className="w-7 h-7 text-purple-400" />
            Routing Non-Compliance Analysis
          </h2>
          <p className="text-white/60 mt-1">
            Transaction routing optimization and compliance monitoring
          </p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Routing Performance KPIs</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 text-sm font-medium">Total Transactions</div>
            <div className="text-blue-300 text-2xl font-bold">835</div>
            <div className="text-blue-200 text-xs">Processed transactions</div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="text-orange-400 text-sm font-medium">Incorrect Routing</div>
            <div className="text-orange-300 text-2xl font-bold">263</div>
            <div className="text-orange-200 text-xs">Routing errors identified</div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="text-red-400 text-sm font-medium">Routing Error %</div>
            <div className="text-red-300 text-2xl font-bold">31.5%</div>
            <div className="text-red-200 text-xs">Error rate</div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 text-sm font-medium">Cost Impact</div>
            <div className="text-yellow-300 text-2xl font-bold">₹8.4 Cr</div>
            <div className="text-yellow-200 text-xs">Estimated impact</div>
          </div>
        </div>
      </div>

      {/* Routing Error Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Routing Error Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Txn ID</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Network</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Card Type</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Preferred Acquirer</th>
                <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">Actual Acquirer</th>
                <th className="px-4 py-3 text-right text-white/80 font-medium text-sm">Cost Impact</th>
              </tr>
            </thead>
            <tbody>
              {routingNonComplianceData.routingErrors.slice(0, 5).map((row: any) => (
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
            Showing 5 of {routingNonComplianceData.routingErrors.length} routing errors
          </p>
        </div>
      </div>
    </div>
  )
}

const PaymentAnalyticsDashboard: React.FC<PaymentAnalyticsDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<string>(DASHBOARD_TABS.EXECUTIVE)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderActiveDashboard = () => {
    switch (activeTab) {
      case DASHBOARD_TABS.EXECUTIVE:
        return <SimpleExecutiveDashboard />
      case DASHBOARD_TABS.RATE_RECONCILIATION:
        return <SimpleRateReconciliationDashboard />
      case DASHBOARD_TABS.SLA_DELAY:
        return <SimpleSLADelayDashboard />
      case DASHBOARD_TABS.ROUTING_COMPLIANCE:
        return <SimpleRoutingNonComplianceDashboard />
      default:
        return <SimpleSLADelayDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-7 h-7 text-blue-400" />
                Dashboard
              </h1>
              <p className="text-white/60 text-sm">
                Comprehensive payment processing insights and compliance monitoring
              </p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Data</span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SimpleDashboardNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </motion.div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveDashboard()}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-8 p-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-white/40 text-sm">
                Data as of: 01 Jan 2024 – 31 Mar 2024 | Last updated: {new Date().toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-white/40 text-sm">
                <span>Total Collection: ₹2,421 Cr</span>
                <span>•</span>
                <span>4 Acquirers</span>
                <span>•</span>
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentAnalyticsDashboard