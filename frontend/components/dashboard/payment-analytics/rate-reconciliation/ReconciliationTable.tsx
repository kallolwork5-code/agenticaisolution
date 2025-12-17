'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  DollarSign,
  Percent,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

import { ReconciliationRow, TableColumn } from '../types'
import { rateReconciliationData } from '../data'
import { TABLE_CONFIG, ANIMATION_VARIANTS } from '../constants'
import { 
  sortTableData, 
  paginateData, 
  getTotalPages, 
  filterTableData,
  formatCurrencyValue,
  formatPercentageValue,
  exportToCSV
} from '../utils'

interface ReconciliationTableProps {
  data?: ReconciliationRow[]
  pageSize?: number
  showExport?: boolean
}

const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  data = rateReconciliationData.reconciliationRows,
  pageSize = TABLE_CONFIG.ROWS_PER_PAGE_OPTIONS[0],
  showExport = true
}) => {
  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string>('slNo')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAcquirer, setFilterAcquirer] = useState<string>('all')
  const [rowsPerPage, setRowsPerPage] = useState(pageSize)

  // Table columns configuration
  const columns: TableColumn[] = [
    { key: 'slNo', label: 'Sl No', sortable: true, align: 'center' },
    { key: 'uniqueId', label: 'Unique ID', sortable: true, align: 'left' },
    { key: 'acquirer', label: 'Acquirer', sortable: true, align: 'left' },
    { key: 'paymentMode', label: 'Payment Mode', sortable: false, align: 'center' },
    { key: 'network', label: 'Network', sortable: true, align: 'center' },
    { key: 'cardCategory', label: 'Card Category', sortable: true, align: 'left' },
    { key: 'transAmount', label: 'Trans Amount (INR)', sortable: true, align: 'right', format: 'currency' },
    { key: 'appliedMDR', label: 'Applied MDR %', sortable: true, align: 'right', format: 'percentage' },
    { key: 'agreedMDR', label: 'Agreed MDR %', sortable: true, align: 'right', format: 'percentage' },
    { key: 'saving', label: 'Saving (INR)', sortable: true, align: 'right', format: 'currency' }
  ]

  // Get unique acquirers for filter
  const uniqueAcquirers = useMemo(() => {
    const acquirers = Array.from(new Set(data.map(row => row.acquirer)))
    return acquirers.sort()
  }, [data])

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filterTableData(filtered, searchTerm, ['uniqueId', 'acquirer', 'network'])
    }

    // Apply acquirer filter
    if (filterAcquirer !== 'all') {
      filtered = filtered.filter(row => row.acquirer === filterAcquirer)
    }

    // Apply sorting
    const sorted = sortTableData(filtered, sortColumn, sortDirection)

    return sorted
  }, [data, searchTerm, filterAcquirer, sortColumn, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    return paginateData(processedData, currentPage, rowsPerPage)
  }, [processedData, currentPage, rowsPerPage])

  const totalPages = getTotalPages(processedData.length, rowsPerPage)

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Handle export
  const handleExport = () => {
    exportToCSV(processedData, 'rate-reconciliation-errors.csv', columns)
  }

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 text-white/40" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-400" />
      : <ArrowDown className="w-3 h-3 text-blue-400" />
  }

  // Format cell value
  const formatCellValue = (value: any, column: TableColumn) => {
    if (value === null || value === undefined) return '-'
    
    switch (column.format) {
      case 'currency':
        return formatCurrencyValue(value)
      case 'percentage':
        return formatPercentageValue(value)
      default:
        return value.toString()
    }
  }

  // Get row highlight based on saving amount
  const getRowHighlight = (saving: number) => {
    if (saving >= 1000) return 'bg-red-500/10 border-red-500/20' // High value errors
    if (saving >= 500) return 'bg-orange-500/10 border-orange-500/20' // Medium value errors
    return 'bg-white/5 border-white/10' // Standard errors
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white/5 rounded-xl border border-white/10 p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Rate Reconciliation Table
          </h3>
          <p className="text-white/60 text-sm mt-1">
            Detailed view of {processedData.length} MDR rate discrepancies
          </p>
        </div>
        
        {showExport && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Acquirer, or Network..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Acquirer Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={filterAcquirer}
            onChange={(e) => {
              setFilterAcquirer(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 min-w-[150px]"
          >
            <option value="all" className="bg-gray-800">All Acquirers</option>
            {uniqueAcquirers.map(acquirer => (
              <option key={acquirer} value={acquirer} className="bg-gray-800">
                {acquirer}
              </option>
            ))}
          </select>
        </div>

        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Show:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
          >
            {TABLE_CONFIG.ROWS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option} className="bg-gray-800">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    p-3 text-white/80 font-medium cursor-pointer hover:text-white transition-colors
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.sortable ? 'hover:bg-white/5' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <motion.tr
                key={row.uniqueId}
                className={`
                  border-b border-white/5 hover:bg-white/5 transition-colors
                  ${getRowHighlight(row.saving)}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      p-3 text-white/90
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                  >
                    {column.key === 'saving' && row.saving >= 1000 ? (
                      <div className="flex items-center gap-1 justify-end">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="font-semibold text-red-300">
                          {formatCellValue(row[column.key as keyof ReconciliationRow], column)}
                        </span>
                      </div>
                    ) : column.key === 'transAmount' ? (
                      <span className="font-medium">
                        {formatCellValue(row[column.key as keyof ReconciliationRow], column)}
                      </span>
                    ) : column.key === 'uniqueId' ? (
                      <span className="font-mono text-blue-300">
                        {formatCellValue(row[column.key as keyof ReconciliationRow], column)}
                      </span>
                    ) : (
                      formatCellValue(row[column.key as keyof ReconciliationRow], column)
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="text-white/60 text-sm">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, processedData.length)} of {processedData.length} entries
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === page 
                      ? 'bg-orange-500 text-black' 
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {page}
                </button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="text-white/40 px-2">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === totalPages 
                      ? 'bg-orange-500 text-black' 
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300">
              Total Savings: <span className="font-semibold">
                ₹{processedData.reduce((sum, row) => sum + row.saving, 0).toLocaleString()}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300">
              Avg MDR Diff: <span className="font-semibold">
                {(processedData.reduce((sum, row) => sum + (row.appliedMDR - row.agreedMDR), 0) / processedData.length).toFixed(2)}%
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300">
              High Value Errors: <span className="font-semibold">
                {processedData.filter(row => row.saving >= 1000).length}
              </span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReconciliationTable