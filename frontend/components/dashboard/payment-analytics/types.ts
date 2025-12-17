// TypeScript interfaces for Payment Analytics Dashboard

// Common interfaces
export interface DashboardTab {
  id: string
  name: string
  icon?: string
}

export interface KPITile {
  label: string
  value: string
  format: 'currency' | 'percentage' | 'number' | 'text'
  trend?: 'up' | 'down' | 'neutral'
  isWarning?: boolean
}

// Executive Dashboard Types
export interface ExecutiveDashboardData {
  kpis: {
    totalCollection: string
    totalMDRCost: string
    mdrCostPercentage: string
    numberOfAcquirers: number
    timeRange: string
  }
  acquirerCollection: ChartDataPoint[]
  networkSplit: ChartDataPoint[]
  cardType: ChartDataPoint[]
  settlementPeriods: SettlementPeriod[]
  onUsOffUs: ChartDataPoint[]
}

export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface SettlementPeriod {
  acquirer: string
  avgDays: number
  isWarning: boolean
}

// Rate Reconciliation Types
export interface RateReconciliationData {
  summary: {
    totalCollection: string
    transactionErrors: number
    errorPercentage: number
    savingAmount: string
  }
  reconciliationRows: ReconciliationRow[]
}

export interface ReconciliationRow {
  slNo: number
  uniqueId: string
  acquirer: string
  paymentMode: string
  network: string
  cardCategory: string
  transAmount: number
  appliedMDR: number
  agreedMDR: number
  saving: number
}

// SLA Delay Types
export interface SLADelayData {
  summary: {
    totalCollection: string
    transactionErrors: number
    errorPercentage: number
    maxDelay: number
  }
  delayRows: SLADelayRow[]
}

export interface SLADelayRow {
  slNo: number
  uniqueId: string
  acquirer: string
  paymentMode: string
  network: string
  cardCategory: string
  transAmount: number
  transDate: string
  settlementDate: string
  delayDays: number
}

// Routing Non-Compliance Types
export interface RoutingNonComplianceData {
  kpis: {
    totalTransactions: number
    incorrectRouting: number
    routingErrorPercentage: number
    estimatedCostImpact: string
  }
  routingErrors: RoutingErrorRow[]
}

export interface RoutingErrorRow {
  txnId: string
  network: string
  cardType: string
  preferredAcquirer: string
  actualAcquirer: string
  costImpact: number
}

// Component Props Types
export interface PaymentAnalyticsDashboardProps {
  onBack: () => void
}

export interface NavigationProps {
  tabs: DashboardTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export interface SummaryPanelProps {
  data: {
    totalCollection: string
    transactionErrors: number
    errorPercentage: number
    savingAmount?: string
    maxDelay?: number
  }
}

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumn[]
  totalRows?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  format?: 'currency' | 'percentage' | 'number' | 'date' | 'text'
  align?: 'left' | 'center' | 'right'
}