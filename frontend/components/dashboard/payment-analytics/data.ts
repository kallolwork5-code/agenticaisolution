// Static data for Payment Analytics Dashboard
// This data is pre-calculated and should be displayed without backend recomputation

import { 
  ExecutiveDashboardData, 
  RateReconciliationData, 
  SLADelayData, 
  RoutingNonComplianceData 
} from './types'

// Executive Dashboard Data
export const executiveDashboardData: ExecutiveDashboardData = {
  kpis: {
    totalCollection: "₹2,421 Cr",
    totalMDRCost: "₹51.2 Cr", 
    mdrCostPercentage: "2.11%",
    numberOfAcquirers: 4,
    timeRange: "01 Jan 2024 – 31 Mar 2024"
  },
  acquirerCollection: [
    { name: "HDFC", value: 1020, color: "#3B82F6" },
    { name: "ICICI", value: 740, color: "#10B981" },
    { name: "Axis", value: 430, color: "#F59E0B" },
    { name: "SBI", value: 231, color: "#EF4444" }
  ],
  networkSplit: [
    { name: "VISA", value: 48, color: "#1E40AF" },
    { name: "Mastercard", value: 32, color: "#DC2626" },
    { name: "RuPay", value: 15, color: "#059669" },
    { name: "Amex", value: 5, color: "#7C3AED" }
  ],
  cardType: [
    { name: "Credit", value: 72, color: "#3B82F6" },
    { name: "Debit", value: 28, color: "#10B981" }
  ],
  settlementPeriods: [
    { acquirer: "HDFC", avgDays: 1.8, isWarning: false },
    { acquirer: "ICICI", avgDays: 2.4, isWarning: false },
    { acquirer: "Axis", avgDays: 3.1, isWarning: true },
    { acquirer: "SBI", avgDays: 2.9, isWarning: true }
  ],
  onUsOffUs: [
    { name: "On-us", value: 61, color: "#3B82F6" },
    { name: "Off-us", value: 39, color: "#10B981" }
  ]
}

// Rate Reconciliation Data
export const rateReconciliationData: RateReconciliationData = {
  summary: {
    totalCollection: "₹2,421 Cr",
    transactionErrors: 150,
    errorPercentage: 29.5,
    savingAmount: "₹25.6 Cr"
  },
  reconciliationRows: [
    {
      slNo: 1,
      uniqueId: "TXN98231",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 125000,
      appliedMDR: 2.40,
      agreedMDR: 1.85,
      saving: 688
    },
    {
      slNo: 2,
      uniqueId: "TXN87342",
      acquirer: "ICICI",
      paymentMode: "Card",
      network: "MC",
      cardCategory: "Commercial",
      transAmount: 210000,
      appliedMDR: 2.60,
      agreedMDR: 2.10,
      saving: 1050
    },
    {
      slNo: 3,
      uniqueId: "TXN77412",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 98000,
      appliedMDR: 2.30,
      agreedMDR: 1.85,
      saving: 441
    },
    {
      slNo: 4,
      uniqueId: "TXN66521",
      acquirer: "SBI",
      paymentMode: "Card",
      network: "MC",
      cardCategory: "Consumer",
      transAmount: 56000,
      appliedMDR: 2.30,
      agreedMDR: 1.90,
      saving: 224
    },
    {
      slNo: 5,
      uniqueId: "TXN55411",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "RuPay",
      cardCategory: "Consumer",
      transAmount: 42000,
      appliedMDR: 1.20,
      agreedMDR: 0.90,
      saving: 126
    },
    {
      slNo: 6,
      uniqueId: "TXN44329",
      acquirer: "ICICI",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Commercial",
      transAmount: 320000,
      appliedMDR: 2.80,
      agreedMDR: 2.20,
      saving: 1920
    },
    {
      slNo: 7,
      uniqueId: "TXN33119",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 180000,
      appliedMDR: 2.35,
      agreedMDR: 1.85,
      saving: 900
    },
    {
      slNo: 8,
      uniqueId: "TXN22871",
      acquirer: "SBI",
      paymentMode: "Card",
      network: "MC",
      cardCategory: "Consumer",
      transAmount: 74000,
      appliedMDR: 2.10,
      agreedMDR: 1.60,
      saving: 370
    }
  ]
}

// SLA Delay Data
export const slaDelayData: SLADelayData = {
  summary: {
    totalCollection: "₹2,421 Cr",
    transactionErrors: 215,
    errorPercentage: 42.3,
    maxDelay: 7
  },
  delayRows: [
    {
      slNo: 1,
      uniqueId: "TXN98231",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 125000,
      transDate: "05-Jan",
      settlementDate: "10-Jan",
      delayDays: 5
    },
    {
      slNo: 2,
      uniqueId: "TXN87342",
      acquirer: "SBI",
      paymentMode: "Card",
      network: "MC",
      cardCategory: "Consumer",
      transAmount: 98000,
      transDate: "06-Jan",
      settlementDate: "12-Jan",
      delayDays: 6
    },
    {
      slNo: 3,
      uniqueId: "TXN77412",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Commercial",
      transAmount: 210000,
      transDate: "08-Jan",
      settlementDate: "14-Jan",
      delayDays: 6
    },
    {
      slNo: 4,
      uniqueId: "TXN66521",
      acquirer: "SBI",
      paymentMode: "Card",
      network: "MC",
      cardCategory: "Consumer",
      transAmount: 56000,
      transDate: "10-Jan",
      settlementDate: "18-Jan",
      delayDays: 8
    },
    {
      slNo: 5,
      uniqueId: "TXN55411",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "RuPay",
      cardCategory: "Consumer",
      transAmount: 42000,
      transDate: "12-Jan",
      settlementDate: "20-Jan",
      delayDays: 8
    },
    {
      slNo: 6,
      uniqueId: "TXN44329",
      acquirer: "ICICI",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Commercial",
      transAmount: 320000,
      transDate: "18-Feb",
      settlementDate: "24-Feb",
      delayDays: 6
    },
    {
      slNo: 7,
      uniqueId: "TXN33119",
      acquirer: "Axis",
      paymentMode: "Card",
      network: "VISA",
      cardCategory: "Consumer",
      transAmount: 180000,
      transDate: "03-Mar",
      settlementDate: "10-Mar",
      delayDays: 7
    }
  ]
}

// Routing Non-Compliance Data
export const routingNonComplianceData: RoutingNonComplianceData = {
  kpis: {
    totalTransactions: 835,
    incorrectRouting: 263,
    routingErrorPercentage: 31.5,
    estimatedCostImpact: "₹8.4 Cr"
  },
  routingErrors: [
    {
      txnId: "TXN98231",
      network: "VISA",
      cardType: "Credit",
      preferredAcquirer: "HDFC",
      actualAcquirer: "Axis",
      costImpact: 312
    },
    {
      txnId: "TXN87342",
      network: "MC",
      cardType: "Debit",
      preferredAcquirer: "ICICI",
      actualAcquirer: "SBI",
      costImpact: 198
    },
    {
      txnId: "TXN77412",
      network: "VISA",
      cardType: "Credit",
      preferredAcquirer: "HDFC",
      actualAcquirer: "Axis",
      costImpact: 421
    },
    {
      txnId: "TXN66521",
      network: "MC",
      cardType: "Credit",
      preferredAcquirer: "ICICI",
      actualAcquirer: "SBI",
      costImpact: 275
    },
    {
      txnId: "TXN55411",
      network: "RuPay",
      cardType: "Debit",
      preferredAcquirer: "HDFC",
      actualAcquirer: "Axis",
      costImpact: 96
    },
    {
      txnId: "TXN44329",
      network: "VISA",
      cardType: "Credit",
      preferredAcquirer: "HDFC",
      actualAcquirer: "ICICI",
      costImpact: 388
    },
    {
      txnId: "TXN33119",
      network: "MC",
      cardType: "Debit",
      preferredAcquirer: "ICICI",
      actualAcquirer: "Axis",
      costImpact: 214
    }
  ]
}

// Dashboard tabs configuration
export const dashboardTabs = [
  { id: 'executive', name: 'Executive Dashboard' },
  { id: 'rate-reconciliation', name: 'Rate Reconciliation' },
  { id: 'sla-delay', name: 'SLA Delay' },
  { id: 'routing-compliance', name: 'Routing Non-Compliance' }
]

// Utility functions for data formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value)
}