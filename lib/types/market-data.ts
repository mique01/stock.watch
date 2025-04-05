// Market data types

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  previousClose?: number
  latestTradingDay?: string
  currency: string
  error?: boolean
}

export interface StockOverview {
  symbol: string
  name: string
  description: string
  exchange: string
  currency: string
  country: string
  sector: string
  industry: string
  marketCap: number
  pe: number
  eps: number
  beta: number
  high52Week: number
  low52Week: number
  dividendYield: number
  dividendPerShare: number
  evToEbitda: number
  profitMargin: number
  operatingMargin: number
  returnOnAssets: number
  returnOnEquity: number
  revenuePerShare: number
  priceToBook: number
  priceToSales: number
  website: string
}

export interface TimeSeriesData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  error?: boolean
}

export interface AssetComparison {
  symbol: string
  name: string
  type: "stock" | "commodity" | "treasury" | "crypto" | "index"
  data: TimeSeriesData[]
  metrics?: Record<string, number>
  color?: string
}

export interface FinancialMetric {
  name: string
  value: number
  format: "currency" | "percentage" | "number" | "ratio"
  description: string
}

export interface MetricHistorical {
  date: string
  value: number
}

export interface MetricTimeSeries {
  metric: string
  data: MetricHistorical[]
}

