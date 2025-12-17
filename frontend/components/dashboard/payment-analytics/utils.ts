// Utility functions for Payment Analytics Dashboard

import { TableColumn } from './types'

// Data validation functions
export const validateDashboardData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid dashboard data: data is null or not an object')
    return false
  }
  return true
}

export const validateChartData = (data: any[]): boolean => {
  if (!Array.isArray(data)) {
    console.error('Invalid chart data: data is not an array')
    return false
  }
  
  return data.every(item => 
    item && 
    typeof item === 'object' && 
    'name' in item && 
    'value' in item &&
    typeof item.value === 'number'
  )
}

// Formatting utilities
export const formatCurrencyValue = (amount: number): string => {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(1)} Cr`
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(1)} L`
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(1)} K`
  } else {
    return `₹${amount.toLocaleString('en-IN')}`
  }
}

export const formatPercentageValue = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumberValue = (value: number): string => {
  return value.toLocaleString('en-IN')
}

export const formatDateValue = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch (error) {
    return dateString // Return original if parsing fails
  }
}

// Table utilities
export const sortTableData = <T>(
  data: T[], 
  column: string, 
  direction: 'asc' | 'desc'
): T[] => {
  return [...data].sort((a, b) => {
    const aValue = (a as any)[column]
    const bValue = (b as any)[column]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })
}

export const paginateData = <T>(
  data: T[], 
  page: number, 
  pageSize: number
): T[] => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return data.slice(startIndex, endIndex)
}

export const getTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize)
}

// Chart color utilities
export const getChartColors = (count: number): string[] => {
  const standardColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ]
  
  // Repeat colors if we need more than available
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(standardColors[i % standardColors.length])
  }
  
  return colors
}

// Warning and status utilities
export const getStatusColor = (isWarning: boolean): string => {
  return isWarning ? '#EF4444' : '#10B981' // Red for warning, Green for normal
}

export const getDelayStatusColor = (delayDays: number): string => {
  if (delayDays >= 7) return '#EF4444' // Red for high delay
  if (delayDays >= 5) return '#F59E0B' // Yellow for medium delay
  return '#10B981' // Green for low delay
}

export const getErrorPercentageColor = (percentage: number): string => {
  if (percentage >= 40) return '#EF4444' // Red for high error rate
  if (percentage >= 25) return '#F59E0B' // Yellow for medium error rate
  return '#10B981' // Green for low error rate
}

// Data aggregation utilities
export const calculateTotal = (data: any[], field: string): number => {
  return data.reduce((sum, item) => sum + (item[field] || 0), 0)
}

export const calculateAverage = (data: any[], field: string): number => {
  if (data.length === 0) return 0
  const total = calculateTotal(data, field)
  return total / data.length
}

export const findMaxValue = (data: any[], field: string): number => {
  if (data.length === 0) return 0
  return Math.max(...data.map(item => item[field] || 0))
}

export const findMinValue = (data: any[], field: string): number => {
  if (data.length === 0) return 0
  return Math.min(...data.map(item => item[field] || 0))
}

// Search and filter utilities
export const filterTableData = <T>(
  data: T[], 
  searchTerm: string, 
  searchFields: string[]
): T[] => {
  if (!searchTerm.trim()) return data
  
  const lowercaseSearch = searchTerm.toLowerCase()
  
  return data.filter(item => 
    searchFields.some(field => {
      const value = (item as any)[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch)
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm)
      }
      return false
    })
  )
}

// Export utilities for external use
export const exportToCSV = <T>(data: T[], filename: string, columns: TableColumn[]): void => {
  const headers = columns.map(col => col.label).join(',')
  const rows = data.map(item => 
    columns.map(col => {
      const value = (item as any)[col.key]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}