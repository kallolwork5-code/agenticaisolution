'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  AlertTriangle, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Timer,
  DollarSign,
  CreditCard,
  Building2
} from 'lucide-react'

import { slaDelayData } from '../data'
import { SLADelayRow } from '../types'
import { ANIMATION_VARIANTS, SLA_THRESHOLDS, TABLE_CONFIG } from '../constants'
import { formatCurrencyValue, formatNumberValue } from '../utils'

interface SLADelayTableProps {
  data?: SLADelayRow[]
  pageSize?: number
  showSearch?: boolean
  showPagination?: boolean
}

type SortColumn = keyof SLADelayRow
type SortDirection = 'asc' | 'desc'

const SLADelayTable: React.FC<SLADelayTableProps> = ({
  data = slaDelayData.delayRows,
  pageSize = TABLE_CONFIG.ROWS_PER_PAGE_OPTIONS[0],
  showSearch = true,
  showPagination = true
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('delayDays')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Get delay severity status
  const getDelayStatus = (delayDays: number) => {
    if (delayDays >= SLA_THRESHOLDS.DELAY_DAYS.CRITICAL) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Critical',
        priority: 3
      }
    } else if (delayDays >= SLA_THRESHOLDS.DELAY_DAYS.WARNING) {
      return {
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/50',
        icon: <Clock className="w-4 h-4" />,
        label: 'High',
        priority: 2
      }
    } else {
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: <Timer className="w-4 h-4" />,
        label: 'Medium',
        priority: 1
      }
    }
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(row => 
      row.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.acquirer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.cardCategory.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortColumn]
      let bValue = b[sortColumn]

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle string sorting
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

    return filtered
  }, [data, searchTerm, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = filteredAndSortedData.slice(startIndex, endIndex)

  // Handle sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc') // Default to desc for most columns
    }
  }

  // Get sort icon
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-white/40" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />
  }

  // Table columns configuration
  const columns = [
    { 
      key: 'slNo' as SortColumn, 
      label: 'Sl No', 
      width: 'w-16',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'uniqueId' as SortColumn, 
      label: 'Unique ID', 
      width: 'w-28',
      sortable: true,
      align: 'text-left' as const
    },
    { 
      key: 'acquirer' as SortColumn, 
      label: 'Acquirer', 
      width: 'w-24',
      sortable: true,
      align: 'text-left' as const
    },
    { 
      key: 'paymentMode' as SortColumn, 
      label: 'Payment Mode', 
      width: 'w-28',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'network' as SortColumn, 
      label: 'Network', 
      width: 'w-24',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'cardCategory' as SortColumn, 
      label: 'Card Category', 
      width: 'w-28',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'transAmount' as SortColumn, 
      label: 'Trans Amount', 
      width: 'w-32',
      sortable: true,
      align: 'text-right' as const
    },
    { 
      key: 'transDate' as SortColumn, 
      label: 'Trans Date', 
      width: 'w-24',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'settlementDate' as SortColumn, 
      label: 'Settlement Date', 
      width: 'w-32',
      sortable: true,
      align: 'text-center' as const
    },
    { 
      key: 'delayDays' as SortColumn, 
      label: 'Delay (Days)', 
      width: 'w-28',
      sortable: true,
      align: 'text-center' as const
    }
  ]

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock className="w-6 h-6 text-red-400" />
            SLA Delay Transactions
          </h3>
          <p className="text-white/60 mt-1">
            Detailed view of transactions exceeding settlement SLA targets
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">Total Delayed</div>
          <div className="text-red-400 font-bold text-lg">{filteredAndSortedData.length} transactions</div>
        </div>
      </div>

      {/* Search and Filters */}
      {showSearch && (
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Acquirer, Network..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
              className="
                w-full pl-10 pr-4 py-2 
                bg-white/10 border border-white/20 rounded-lg
                text-white placeholder-white/40
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                transition-all duration-200
              "
            />
          </div>
          
          {/* Delay Severity Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-white/70">3-4 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-white/70">5-6 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-white/70">≥7 days</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${column.width} px-4 py-3 text-white/80 font-medium text-sm
                    ${column.align}
                    ${column.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {currentData.map((row, index) => {
              const delayStatus = getDelayStatus(row.delayDays)
              const isEvenRow = index % 2 === 0
              
              return (
                <motion.tr
                  key={row.uniqueId}
                  className={`
                    border-b border-white/5 hover:bg-white/5 transition-colors duration-200
                    ${isEvenRow ? 'bg-white/2' : 'bg-transparent'}
                  `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {/* Sl No */}
                  <td className="px-4 py-3 text-center text-white/70 text-sm">
                    {startIndex + index + 1}
                  </td>

                  {/* Unique ID */}
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium text-sm">{row.uniqueId}</span>
                    </div>
                  </td>

                  {/* Acquirer */}
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{row.acquirer}</span>
                    </div>
                  </td>

                  {/* Payment Mode */}
                  <td className="px-4 py-3 text-center text-white/80 text-sm">
                    {row.paymentMode}
                  </td>

                  {/* Network */}
                  <td className="px-4 py-3 text-center">
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

                  {/* Card Category */}
                  <td className="px-4 py-3 text-center text-white/80 text-sm">
                    {row.cardCategory}
                  </td>

                  {/* Trans Amount */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium text-sm">
                        {formatCurrencyValue(row.transAmount)}
                      </span>
                    </div>
                  </td>

                  {/* Trans Date */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">{row.transDate}</span>
                    </div>
                  </td>

                  {/* Settlement Date */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-white/80 text-sm">{row.settlementDate}</span>
                    </div>
                  </td>

                  {/* Delay Days */}
                  <td className="px-4 py-3 text-center">
                    <div className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full border
                      ${delayStatus.bgColor} ${delayStatus.borderColor}
                    `}>
                      {delayStatus.icon}
                      <span className={`${delayStatus.color} font-bold text-sm`}>
                        {row.delayDays} days
                      </span>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {currentData.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No delayed transactions found</p>
            <p className="text-white/40 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search criteria' : 'All transactions are within SLA targets'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <div className="text-sm text-white/60">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} transactions
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="
                p-2 rounded-lg border border-white/20 
                text-white/60 hover:text-white hover:bg-white/10
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
                      ${currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="
                p-2 rounded-lg border border-white/20 
                text-white/60 hover:text-white hover:bg-white/10
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="text-red-400 text-sm font-medium">Critical Delays (≥7 days)</div>
            <div className="text-red-300 text-xl font-bold">
              {filteredAndSortedData.filter(row => row.delayDays >= SLA_THRESHOLDS.DELAY_DAYS.CRITICAL).length}
            </div>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="text-orange-400 text-sm font-medium">High Delays (5-6 days)</div>
            <div className="text-orange-300 text-xl font-bold">
              {filteredAndSortedData.filter(row => row.delayDays >= SLA_THRESHOLDS.DELAY_DAYS.WARNING && row.delayDays < SLA_THRESHOLDS.DELAY_DAYS.CRITICAL).length}
            </div>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-yellow-400 text-sm font-medium">Medium Delays (3-4 days)</div>
            <div className="text-yellow-300 text-xl font-bold">
              {filteredAndSortedData.filter(row => row.delayDays < SLA_THRESHOLDS.DELAY_DAYS.WARNING).length}
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="text-blue-400 text-sm font-medium">Total Delayed Value</div>
            <div className="text-blue-300 text-xl font-bold">
              ₹{(filteredAndSortedData.reduce((sum, row) => sum + row.transAmount, 0) / 10000000).toFixed(1)} Cr
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SLADelayTable