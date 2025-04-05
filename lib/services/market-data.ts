// Unified market data service
import { fetchData, type FetchConfig } from "../api/data-provider"
import * as alphaVantage from "../api/alpha-vantage-api"
import * as finnhub from "../api/finnhub-api"
import * as commodityApi from "../api/commodity-api"
import * as treasuryApi from "../api/treasury-api"
import type {
  StockQuote,
  StockOverview,
  TimeSeriesData,
  MarketIndex,
  AssetComparison,
  MetricTimeSeries,
} from "../types/market-data"
import { logError } from "../utils"

export type StockSummary = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}

const TOP_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
]

/**
 * Get stock quotes for a list of top stocks
 */
export async function getTopStocks(): Promise<StockSummary[]> {
  try {
    // Flag to track if we hit any API errors
    let hitApiErrors = false;
    
    // Try to get real data from the API
    const promises = TOP_STOCKS.map(async (stock) => {
      try {
        // Try to get real data from Alpha Vantage
        const quoteData = await alphaVantage.getStockQuote(stock.symbol)
        
        return {
          symbol: stock.symbol,
          name: stock.name,
          price: quoteData.price,
          change: quoteData.change,
          changePercent: quoteData.changePercent,
          currency: quoteData.currency || "USD",
          isMockData: false
        }
      } catch (error) {
        // Mark that we've hit API errors
        hitApiErrors = true;
        
        console.warn(`Using mock data for ${stock.name} (${stock.symbol}) due to API error.`)
        const mockData = generateMockStockData(stock.symbol, stock.name);
        
        return {
          ...mockData,
          isMockData: true
        };
      }
    })

    const results = await Promise.all(promises)
    
    // If we hit any API errors, log a warning
    if (hitApiErrors) {
      console.warn("Some stocks are using mock data due to API errors.");
    }
    
    return results
  } catch (error) {
    console.error("Error fetching top stocks:", error)
    
    // If API fails, return mock data
    return TOP_STOCKS.map(stock => {
      const mockData = generateMockStockData(stock.symbol, stock.name);
      return {
        ...mockData,
        isMockData: true
      };
    })
  }
}

/**
 * Generate mock stock data when API is unavailable
 */
function generateMockStockData(symbol: string, name: string): StockSummary {
  const basePrice = 100 + Math.floor(Math.random() * 900)
  const changePercent = (Math.random() * 6) - 3 // -3% to +3%
  const change = basePrice * (changePercent / 100)
  
  return {
    symbol,
    name,
    price: basePrice,
    change,
    changePercent,
    currency: "USD"
  }
}

/**
 * Get time series data for a symbol
 */
export async function getTimeSeries(
  symbol: string,
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" = "1Y"
): Promise<TimeSeriesData[]> {
  try {
    // Map timeframe to Alpha Vantage interval
    let interval: string
    let outputSize = "compact"
    
    switch (timeframe) {
      case "1D":
        interval = "5min"
        break
      case "1W":
        interval = "60min"
        break
      case "1M":
        interval = "daily"
        break
      case "3M":
        interval = "daily"
        break
      case "1Y":
        interval = "daily"
        outputSize = "full"
        break
      case "5Y":
        interval = "weekly"
        outputSize = "full"
        break
      default:
        interval = "daily"
    }
    
    // Get data from Alpha Vantage
    const data = await alphaVantage.getTimeSeries(symbol, interval, outputSize)
    
    // If we got data, return it
    if (data && data.length > 0) {
      // Limit the amount of data based on timeframe
      const limitedData = data.slice(-getTimeframeDataPoints(timeframe))
      return limitedData
    }
    
    // If no data, use mock data
    return generateMockTimeSeriesData(timeframe)
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error)
    return generateMockTimeSeriesData(timeframe)
  }
}

// Helper to determine how many data points to show based on timeframe
function getTimeframeDataPoints(timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"): number {
  switch (timeframe) {
    case "1D": return 78; // 5-min intervals for 6.5 trading hours
    case "1W": return 7 * 24; // hourly data for a week
    case "1M": return 30;
    case "3M": return 90;
    case "1Y": return 252; // typical trading days in a year
    case "5Y": return 260; // weekly data for 5 years
    default: return 100;
  }
}

/**
 * Generate mock time series data when API is unavailable
 */
function generateMockTimeSeriesData(interval: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const points = interval === "1D" ? 24 : 
                interval === "1W" ? 7 : 
                interval === "1M" ? 30 : 
                interval === "3M" ? 90 : 
                interval === "1Y" ? 250 : 1250 // 5Y
  
  const now = new Date()
  let currentPrice = 100 + Math.random() * 100
  
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)
    
    if (interval === "1D") {
      date.setHours(date.getHours() - i)
    } else {
      date.setDate(date.getDate() - i)
    }
    
    // Add some randomness but with an overall trend
    const randomChange = (Math.random() - 0.48) * 2
    currentPrice = Math.max(1, currentPrice * (1 + randomChange / 100))
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: currentPrice,
    })
  }
  
  return data
}

/**
 * Get market indices data
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  // Define the indices we want to track
  const indices = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^DJI", name: "Dow Jones" },
    { symbol: "^IXIC", name: "NASDAQ" },
    { symbol: "^VIX", name: "VIX" },
    { symbol: "DX-Y.NYB", name: "US Dollar" }
  ]
  
  try {
    // Flag to track if we hit any API errors
    let hitApiErrors = false;
    
    // Try to get real data from Alpha Vantage API
    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const quote = await alphaVantage.getStockQuote(index.symbol)
          return {
            symbol: index.symbol,
            name: index.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            currency: quote.currency || "USD",
            isMockData: false
          }
        } catch (error) {
          // Mark that we've hit API errors
          hitApiErrors = true;
          
          console.warn(`Using mock data for ${index.name} (${index.symbol}) due to API error.`)
          
          // Return mock data with a flag indicating it's not real
          const mockData = {
            symbol: index.symbol,
            name: index.name,
            price: getRandomIndexPrice(index.symbol),
            change: Math.random() * 50 - 25,
            changePercent: Math.random() * 2 - 1,
            currency: "USD",
            isMockData: true
          }
          
          return mockData
        }
      })
    )
    
    // If we hit any API errors, log a warning
    if (hitApiErrors) {
      console.warn("Some market indices are using mock data due to API errors.");
    }
    
    return results
  } catch (error) {
    console.error("Failed to get market indices", error)
    
    // Return mock data if everything fails
    return indices.map(index => ({
      symbol: index.symbol,
      name: index.name,
      price: getRandomIndexPrice(index.symbol),
      change: Math.random() * 50 - 25,
      changePercent: Math.random() * 2 - 1,
      currency: "USD",
      isMockData: true
    }))
  }
}

// Helper to generate realistic random prices for indices
function getRandomIndexPrice(symbol: string): number {
  switch (symbol) {
    case "^GSPC": return 4500 + Math.random() * 200 - 100; // S&P 500
    case "^DJI": return 35000 + Math.random() * 1000 - 500; // Dow Jones
    case "^IXIC": return 14000 + Math.random() * 500 - 250; // NASDAQ
    case "^VIX": return 15 + Math.random() * 10 - 5; // VIX
    case "DX-Y.NYB": return 100 + Math.random() * 10 - 5; // Dollar Index
    default: return 100 + Math.random() * 50;
  }
}

/**
 * Get historical financial metrics
 */
export async function getMetricTimeSeries(symbol: string, metrics: string[]): Promise<MetricTimeSeries[]> {
  try {
    // In a real application, you would fetch this from your API
    // For now, generate mock data
    return generateMockMetricTimeSeries(metrics)
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error)
    return generateMockMetricTimeSeries(metrics)
  }
}

/**
 * Generate mock metric time series data
 */
function generateMockMetricTimeSeries(metrics: string[]): MetricTimeSeries[] {
  return metrics.map(metricName => {
    const data: { date: string; value: number }[] = []
    const now = new Date()
    
    // Start with a realistic base value for each metric
    let baseValue: number
    
    switch (metricName) {
      case "pe":
        baseValue = 15 + Math.random() * 10
        break
      case "eps":
        baseValue = 2 + Math.random() * 3
        break
      case "evToEbitda":
        baseValue = 8 + Math.random() * 6
        break
      case "profitMargin":
        baseValue = 0.1 + Math.random() * 0.2
        break
      default:
        baseValue = 10 + Math.random() * 10
    }
    
    // Generate quarterly data points for the last 5 years
    for (let i = 19; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i * 3)
      
      // Add some randomness with a slight trend
      const trendFactor = 1 + (i - 10) * 0.01
      const randomFactor = 1 + (Math.random() - 0.5) * 0.2
      const value = baseValue * trendFactor * randomFactor
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value)
      })
    }
    
    return {
      metric: metricName,
      data
    }
  })
}

/**
 * Get stock overview information
 */
export async function getStockOverview(symbol: string): Promise<StockOverview | null> {
  try {
    // Try to get real data from Alpha Vantage
    try {
      const overview = await alphaVantage.getStockOverview(symbol)
      
      // Mark it as real data
      return {
        ...overview,
        isMockData: false
      }
    } catch (error) {
      console.error(`Error fetching overview for ${symbol} from Alpha Vantage:`, error)
      
      // Generate mock data if API fails
      const mockData = generateMockStockOverview(symbol)
      return {
        ...mockData,
        isMockData: true
      }
    }
  } catch (error) {
    console.error(`Error fetching overview for ${symbol}:`, error)
    return null
  }
}

/**
 * Generate mock stock overview data
 */
function generateMockStockOverview(symbol: string): StockOverview {
  const basePrice = 100 + Math.floor(Math.random() * 900)
  const changePercent = (Math.random() * 6) - 3 // -3% to +3%
  const change = basePrice * (changePercent / 100)
  
  return {
    symbol,
    name: getCompanyNameForSymbol(symbol),
    price: basePrice,
    change,
    changePercent,
    currency: "USD",
    marketCap: basePrice * 1000000000 * (1 + Math.random()),
    pe: 10 + Math.random() * 20,
    eps: basePrice / 15,
    high52Week: basePrice * (1 + (Math.random() * 0.3)),
    low52Week: basePrice * (1 - (Math.random() * 0.3)),
    avgVolume: 1000000 + Math.random() * 9000000,
    dividend: Math.random() < 0.7 ? basePrice * 0.02 : 0,
    dividendYield: Math.random() < 0.7 ? 0.01 + Math.random() * 0.04 : 0,
    beta: 0.8 + Math.random() * 0.8,
    description: `${getCompanyNameForSymbol(symbol)} is a leading company in its sector, providing innovative products and services to customers worldwide.`,
    industry: getRandomIndustry(),
    sector: getRandomSector(),
    profitMargin: 0.05 + Math.random() * 0.25,
    operatingMargin: 0.1 + Math.random() * 0.3,
    returnOnEquity: 0.05 + Math.random() * 0.25,
    returnOnAssets: 0.03 + Math.random() * 0.15,
  }
}

// Helper function to get a company name for a symbol
function getCompanyNameForSymbol(symbol: string): string {
  const stock = TOP_STOCKS.find(s => s.symbol === symbol)
  return stock ? stock.name : `${symbol} Inc.`
}

// Helper function to get a random industry
function getRandomIndustry(): string {
  const industries = [
    "Software—Application", 
    "Consumer Electronics", 
    "Internet Content & Information", 
    "Semiconductors", 
    "Aerospace & Defense",
    "Auto Manufacturers",
    "Biotechnology",
    "Drug Manufacturers—General",
    "Banks—Diversified",
    "Credit Services"
  ]
  return industries[Math.floor(Math.random() * industries.length)]
}

// Helper function to get a random sector
function getRandomSector(): string {
  const sectors = [
    "Technology", 
    "Healthcare", 
    "Financial Services", 
    "Consumer Cyclical", 
    "Communication Services",
    "Industrials",
    "Energy",
    "Consumer Defensive",
    "Basic Materials",
    "Real Estate"
  ]
  return sectors[Math.floor(Math.random() * sectors.length)]
}

/**
 * Get asset data for comparison
 */
export async function getAssetComparisonData(
  assets: Array<{
    symbol: string
    type: "stock" | "commodity" | "treasury" | "crypto" | "index"
  }>,
  timeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" = "1Y"
): Promise<AssetComparison[]> {
  try {
    const results = await Promise.all(
      assets.map(async (asset) => {
        try {
          let data: TimeSeriesData[] = []
          let name = asset.symbol

          switch (asset.type) {
            case "stock":
            case "index":
              data = await getTimeSeries(asset.symbol, timeframe)
              const overview = await getStockOverview(asset.symbol)
              name = overview?.name || asset.symbol
              break
            default:
              // For other asset types, use mock data for now
              data = generateMockTimeSeriesData(timeframe)
              name = `${asset.symbol} (${asset.type})`
          }

          return {
            symbol: asset.symbol,
            name,
            type: asset.type,
            data,
          }
        } catch (error) {
          console.error(`Error fetching comparison data for ${asset.symbol}:`, error)
          return {
            symbol: asset.symbol,
            name: asset.symbol,
            type: asset.type,
            data: [],
            error: true,
          }
        }
      })
    )

    return results
  } catch (error) {
    console.error("Error fetching asset comparison data:", error)
    throw error
  }
}

