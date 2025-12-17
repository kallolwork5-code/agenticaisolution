'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

import { executiveDashboardData } from '../data'
import { BarChartData } from '@/lib/chart-types'

interface AcquirerCollectionChartProps {
  height?: number
  animated?: boolean
}

const AcquirerCollectionChart: React.FC<AcquirerCollectionChartProps> = ({
  height = 300,
  animated = true
}) => {
  // Convert data to chart format
  const chartData: BarChartData[] = executiveDashboardData.acquirerCollection.map(item => ({
    name: item.name,
    value: item.value,
    fill: item.color || '#3B82F6'
  }))

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Collection: <span className="font-semibold">₹{payload[0].value} Cr</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.1)" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'rgba(255,255,255,0.7)', 
              fontSize: 12,
              fontWeight: 500
            }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'rgba(255,255,255,0.7)', 
              fontSize: 12 
            }}
            label={{ 
              value: '₹ Crores', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' }
            }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            animationDuration={animated ? 1000 : 0}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Data Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="text-center p-2 bg-white/5 rounded-lg">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-1"
              style={{ backgroundColor: item.fill }}
            />
            <div className="text-white/80 text-xs font-medium">{item.name}</div>
            <div className="text-white/60 text-xs">₹{item.value} Cr</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default AcquirerCollectionChart