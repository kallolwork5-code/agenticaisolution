'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import ChartContainer from '../charts/ChartContainer'
import InteractiveBarChart from '../charts/InteractiveBarChart'
import InteractivePieChart from '../charts/InteractivePieChart'
import TrendLineChart from '../charts/TrendLineChart'
import { BarChartData, PieChartData, TrendData } from '@/lib/chart-types'

interface AnalyticsDashboardProps {
  onBack: () => void
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  // Transform data to Recharts format
  const acquirerData: BarChartData[] = [
    { name: 'HDFC', value: 85, fill: '#10b981' },
    { name: 'ICICI', value: 72, fill: '#34d399' },
    { name: 'SBI', value: 68, fill: '#6ee7b7' },
    { name: 'Axis', value: 45, fill: '#ffffff' },
    { name: 'Kotak', value: 38, fill: '#a7f3d0' }
  ]

  const networkData: PieChartData[] = [
    { name: 'Visa', value: 45, fill: '#10b981' },
    { name: 'Mastercard', value: 30, fill: '#34d399' },
    { name: 'RuPay', value: 20, fill: '#ffffff' },
    { name: 'Amex', value: 5, fill: '#6ee7b7' }
  ]

  const cardTypeData: PieChartData[] = [
    { name: 'Debit', value: 60, fill: '#10b981' },
    { name: 'Credit', value: 35, fill: '#34d399' },
    { name: 'Prepaid', value: 5, fill: '#ffffff' }
  ]

  const settlementData: BarChartData[] = [
    { name: 'T+0', value: 25, fill: '#10b981' },
    { name: 'T+1', value: 65, fill: '#34d399' },
    { name: 'T+2', value: 85, fill: '#ffffff' },
    { name: 'T+3', value: 15, fill: '#6ee7b7' }
  ]

  const currencyRangeData: BarChartData[] = [
    { name: '0-1K', value: 40, fill: '#10b981' },
    { name: '1K-5K', value: 75, fill: '#34d399' },
    { name: '5K-10K', value: 55, fill: '#ffffff' },
    { name: '10K+', value: 30, fill: '#6ee7b7' }
  ]

  const grossOffnetData: PieChartData[] = [
    { name: 'Gross', value: 75, fill: '#10b981' },
    { name: 'Off-net', value: 25, fill: '#ffffff' }
  ]

  // Sample trend data for metric cards
  const generateTrendData = (baseValue: number): TrendData[] => {
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push({
        date: date.toISOString().split('T')[0],
        value: baseValue + (Math.random() - 0.5) * baseValue * 0.2
      })
    }
    return dates
  }

  // Dummy data based on transaction data structure
  const topMetrics = [
    { 
      label: 'Total Collection (in INR)', 
      value: '₹45,67,890', 
      change: '+12.5%', 
      changeType: 'positive',
      icon: DollarSign 
    },
    { 
      label: 'Total MDR Cost (in INR)', 
      value: '₹2,34,567', 
      change: '+8.2%', 
      changeType: 'positive',
      icon: TrendingUp 
    },
    { 
      label: 'MDR Cost (in %)', 
      value: '2.34%', 
      change: '-0.12%', 
      changeType: 'negative',
      icon: BarChart3 
    },
    { 
      label: 'No. of Acquirer', 
      value: '12', 
      change: '+2', 
      changeType: 'positive',
      icon: Users 
    }
  ]



  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-white/60 text-lg">Comprehensive transaction analytics and insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option className="bg-black text-white">Last 30 Days</option>
              <option className="bg-black text-white">Last 7 Days</option>
              <option className="bg-black text-white">Last 90 Days</option>
            </select>
          </div>
        </motion.div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {topMetrics.map((metric, index) => {
            const trendData = generateTrendData(45000 + index * 10000)
            return (
              <motion.div
                key={metric.label}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-black" />
                  </div>
                  <div className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-white/60 text-sm mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                
                {/* Mini Trend Line Chart */}
                <div className="h-12">
                  <TrendLineChart 
                    data={trendData}
                    height={48}
                    color={metric.changeType === 'positive' ? '#10b981' : '#ef4444'}
                    showDots={false}
                    animated={true}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Time Range Selector */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Time Range</h3>
            <div className="flex gap-2">
              {['7D', '30D', '90D', '1Y'].map((period) => (
                <button
                  key={period}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    period === '30D' 
                      ? 'bg-green-500 text-black' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Acquirer Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ChartContainer title="Acquirer wise collection (in INR Cr)">
              <InteractiveBarChart 
                data={acquirerData}
                title="Acquirer Performance"
                height={200}
                color="#10b981"
              />
            </ChartContainer>
          </motion.div>

          {/* Network Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ChartContainer title="Network Wise Split (in %)">
              <InteractivePieChart 
                data={networkData}
                title="Network Distribution"
                height={200}
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
                data={cardTypeData}
                title="Card Types"
                height={200}
              />
            </ChartContainer>
          </motion.div>

          {/* Settlement Period Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ChartContainer title="Average settlement Period (in Days)">
              <InteractiveBarChart 
                data={settlementData}
                title="Settlement Period"
                height={200}
                color="#34d399"
              />
            </ChartContainer>
          </motion.div>

          {/* Currency Ranges Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <ChartContainer title="Currency Ranges (in %)">
              <InteractiveBarChart 
                data={currencyRangeData}
                title="Currency Distribution"
                height={200}
                color="#6ee7b7"
              />
            </ChartContainer>
          </motion.div>

          {/* Gross Off-net Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ChartContainer title="Gross Off-net bifurcation">
              <InteractivePieChart 
                data={grossOffnetData}
                title="Gross vs Off-net"
                height={200}
              />
            </ChartContainer>
          </motion.div>
        </div>

        {/* Additional Insights */}
        <motion.div
          className="mt-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Key Insights</h3>
              <p className="text-white/60 text-sm">AI-powered transaction analysis</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Top Performing Acquirer</h4>
              <p className="text-green-400 text-lg font-semibold">HDFC Bank</p>
              <p className="text-white/60 text-sm">₹15.2 Cr collection</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Dominant Network</h4>
              <p className="text-green-400 text-lg font-semibold">Visa</p>
              <p className="text-white/60 text-sm">45.2% market share</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-white font-medium mb-2">Average Settlement</h4>
              <p className="text-green-400 text-lg font-semibold">T+1.2 Days</p>
              <p className="text-white/60 text-sm">Improved by 0.3 days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard