'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import { CreditCard, Wallet } from 'lucide-react'

import { executiveDashboardData } from '../data'
import { PieChartData } from '@/lib/chart-types'

interface CardTypeChartProps {
  height?: number
  animated?: boolean
}

const CardTypeChart: React.FC<CardTypeChartProps> = ({
  height = 300,
  animated = true
}) => {
  // Convert data to chart format
  const chartData: PieChartData[] = executiveDashboardData.cardType.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color || '#3B82F6'
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name} Cards</p>
          <p className="text-purple-400">
            Share: <span className="font-semibold">{data.value}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Custom label function for pie slices
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${name}`}
      </text>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            animationDuration={animated ? 1000 : 0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Card Type Breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item, index) => {
          const isCredit = item.name.toLowerCase().includes('credit')
          const Icon = isCredit ? CreditCard : Wallet
          const bgColor = isCredit ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'
          const textColor = isCredit ? 'text-blue-400' : 'text-green-400'
          const valueColor = isCredit ? 'text-blue-300' : 'text-green-300'
          
          return (
            <div key={item.name} className={`${bgColor} border rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${textColor}`} />
                <span className={`text-sm font-medium ${textColor}`}>{item.name}</span>
              </div>
              <div className={`text-2xl font-bold ${valueColor}`}>{item.value}%</div>
              <div className="text-white/60 text-xs">
                {isCredit ? 'Premium transactions' : 'Standard transactions'}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Insights */}
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className="text-purple-400 text-sm font-medium">Key Insight</span>
        </div>
        <p className="text-purple-300 text-sm">
          Credit cards dominate with 72% share, indicating higher-value transaction preference
        </p>
      </div>
    </motion.div>
  )
}

export default CardTypeChart