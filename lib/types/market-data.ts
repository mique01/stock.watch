// Market data types

export interface StockQuote {
  price: number
  change: number
  changePercent: number
  symbol?: string
  volume?: number
  latestTradingDay?: string
  previousClose?: number
  currency?: string
}

export interface StockOverview {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  marketCap?: number
  pe?: number
  eps?: number
  high52Week?: number
  low52Week?: number
  avgVolume?: number
  dividend?: number
  dividendYield?: number
  beta?: number
  description?: string
  industry?: string
  sector?: string
  country?: string
  exchange?: string
  website?: string
  profitMargin?: number
  operatingMargin?: number
  returnOnEquity?: number
  returnOnAssets?: number
  priceToBook?: number
  priceToSales?: number
  evToEbitda?: number
  revenuePerShare?: number
  volume?: number
  previousClose?: number
  latestTradingDay?: string
  isMockData?: boolean
}

export interface TimeSeriesData {
  date: string
  value: number
}

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
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
  data: {
    date: string
    value: number
  }[]
}

export interface FetchConfig {
  primaryProvider?: "alpha-vantage" | "finnhub"
  fallbackProvider?: "alpha-vantage" | "finnhub"
  cacheDuration?: number // in seconds
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  cached?: boolean
  timestamp?: number
}

