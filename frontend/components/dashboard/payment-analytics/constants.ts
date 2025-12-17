// Constants for Payment Analytics Dashboard

// Dashboard configuration
export const DASHBOARD_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  CHART_HEIGHT: 300,
  CHART_WIDTH: 400,
  ANIMATION_DURATION: 300,
  REFRESH_INTERVAL: 30000, // 30 seconds (not used since data is static)
} as const

// Color schemes
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981', 
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4',
  PURPLE: '#8B5CF6',
  GRAY: '#6B7280'
} as const

export const ACQUIRER_COLORS = {
  HDFC: '#3B82F6',
  ICICI: '#10B981', 
  Axis: '#F59E0B',
  SBI: '#EF4444'
} as const

export const NETWORK_COLORS = {
  VISA: '#1E40AF',
  Mastercard: '#DC2626',
  RuPay: '#059669', 
  Amex: '#7C3AED'
} as const

// SLA thresholds
export const SLA_THRESHOLDS = {
  SETTLEMENT_DAYS: {
    GOOD: 2,
    WARNING: 3,
    CRITICAL: 4
  },
  ERROR_PERCENTAGE: {
    GOOD: 10,
    WARNING: 25,
    CRITICAL: 40
  },
  DELAY_DAYS: {
    GOOD: 3,
    WARNING: 5,
    CRITICAL: 7
  }
} as const

// Table configuration
export const TABLE_CONFIG = {
  DEFAULT_SORT_COLUMN: 'slNo',
  DEFAULT_SORT_DIRECTION: 'asc' as const,
  ROWS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
  SEARCH_DEBOUNCE_MS: 300
} as const

// Dashboard tabs
export const DASHBOARD_TABS = {
  EXECUTIVE: 'executive',
  RATE_RECONCILIATION: 'rate-reconciliation', 
  SLA_DELAY: 'sla-delay',
  ROUTING_COMPLIANCE: 'routing-compliance'
} as const

// Format types
export const FORMAT_TYPES = {
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  NUMBER: 'number',
  DATE: 'date',
  TEXT: 'text'
} as const

// Chart types
export const CHART_TYPES = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  AREA: 'area'
} as const

// Responsive breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const

// Animation variants for Framer Motion
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  DATA_LOAD_FAILED: 'Failed to load dashboard data',
  CHART_RENDER_FAILED: 'Failed to render chart',
  INVALID_DATA: 'Invalid data format',
  NETWORK_ERROR: 'Network connection error',
  UNKNOWN_ERROR: 'An unexpected error occurred'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_EXPORTED: 'Data exported successfully',
  DASHBOARD_LOADED: 'Dashboard loaded successfully'
} as const

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading', 
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// Currency formatting
export const CURRENCY_CONFIG = {
  LOCALE: 'en-IN',
  CURRENCY: 'INR',
  MINIMUM_FRACTION_DIGITS: 0,
  MAXIMUM_FRACTION_DIGITS: 2
} as const

// Date formatting
export const DATE_CONFIG = {
  LOCALE: 'en-IN',
  FORMAT_OPTIONS: {
    day: '2-digit' as const,
    month: 'short' as const,
    year: 'numeric' as const
  }
} as const