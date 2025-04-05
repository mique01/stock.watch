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

// Get stock quote with fallback
export async function getStockQuote(symbol: string, config?: FetchConfig): Promise<StockQuote> {
  try {
    return await fetchData<StockQuote>(
      "quote",
      { symbol },
      {
        ...config,
        cacheDuration: 60, // 1 minute cache for real-time quotes
      },
    )
  } catch (error) {
    logError(`Error fetching stock quote for ${symbol}:`, error)
    throw error
  }
}

// Get stock overview with fallback
export async function getStockOverview(symbol: string, config?: FetchConfig): Promise<StockOverview> {
  try {
    return await fetchData<StockOverview>(
      "overview",
      { symbol },
      {
        ...config,
        cacheDuration: 86400, // 24 hour cache for company info
      },
    )
  } catch (error) {
    logError(`Error fetching stock overview for ${symbol}:`, error)
    throw error
  }
}

// Get time series data with fallback
export async function getTimeSeries(
  symbol: string,
  timeframe: string,
  config?: FetchConfig,
): Promise<TimeSeriesData[]> {
  try {
    // Map timeframe to appropriate parameters for each provider
    let alphaVantageInterval: string
    let finnhubResolution: string
    let from: number
    const to: number = Math.floor(Date.now() / 1000)

    switch (timeframe) {
      case "1D":
        alphaVantageInterval = "5min"
        finnhubResolution = "5"
        from = to - 86400 // 1 day ago
        break
      case "1W":
        alphaVantageInterval = "60min"
        finnhubResolution = "60"
        from = to - 604800 // 1 week ago
        break
      case "1M":
        alphaVantageInterval = "daily"
        finnhubResolution = "D"
        from = to - 2592000 // 1 month ago
        break
      case "3M":
        alphaVantageInterval = "daily"
        finnhubResolution = "D"
        from = to - 7776000 // 3 months ago
        break
      case "1Y":
        alphaVantageInterval = "weekly"
        finnhubResolution = "W"
        from = to - 31536000 // 1 year ago
        break
      case "5Y":
        alphaVantageInterval = "monthly"
        finnhubResolution = "M"
        from = to - 157680000 // 5 years ago
        break
      default:
        alphaVantageInterval = "daily"
        finnhubResolution = "D"
        from = to - 2592000 // 1 month ago
    }

    // Try Alpha Vantage first
    if (!config || config.primaryProvider === "alpha-vantage") {
      try {
        return await alphaVantage.getTimeSeries(symbol, alphaVantageInterval, timeframe === "5Y" ? "full" : "compact")
      } catch (error) {
        if (!config?.fallbackProvider) throw error
      }
    }

    // Try Finnhub as fallback
    if (config?.primaryProvider === "finnhub" || config?.fallbackProvider === "finnhub") {
      return await finnhub.getTimeSeries(symbol, finnhubResolution, from, to)
    }

    throw new Error(`Failed to fetch time series data for ${symbol}`)
  } catch (error) {
    logError(`Error fetching time series for ${symbol}:`, error)
    throw error
  }
}

// Get market indices with fallback
export async function getMarketIndices(config?: FetchConfig): Promise<MarketIndex[]> {
  try {
    // Try Alpha Vantage first
    if (!config || config.primaryProvider === "alpha-vantage") {
      try {
        return await alphaVantage.getMarketIndices()
      } catch (error) {
        if (!config?.fallbackProvider) throw error
      }
    }

    // Try Finnhub as fallback
    if (config?.primaryProvider === "finnhub" || config?.fallbackProvider === "finnhub") {
      return await finnhub.getMarketIndices()
    }

    throw new Error("Failed to fetch market indices")
  } catch (error) {
    logError("Error fetching market indices:", error)
    throw error
  }
}

// Get asset data for comparison
export async function getAssetComparisonData(
  assets: Array<{
    symbol: string
    type: "stock" | "commodity" | "treasury" | "crypto" | "index"
  }>,
  timeframe: string,
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
              name = overview.name
              break
            case "commodity":
              data = await commodityApi.getCommodityTimeSeries(asset.symbol, timeframe === "1D" ? "daily" : "monthly")
              const commodities = commodityApi.getAvailableCommodities()
              const commodity = commodities.find((c) => c.symbol === asset.symbol)
              if (commodity) name = commodity.name
              break
            case "treasury":
              data = await treasuryApi.getTreasuryTimeSeries(asset.symbol, timeframe === "1D" ? "daily" : "monthly")
              const treasuries = treasuryApi.getAvailableTreasuries()
              const treasury = treasuries.find((t) => t.symbol === asset.symbol)
              if (treasury) name = treasury.name
              break
            default:
              throw new Error(`Unsupported asset type: ${asset.type}`)
          }

          return {
            symbol: asset.symbol,
            name,
            type: asset.type,
            data,
          }
        } catch (error) {
          logError(`Error fetching comparison data for ${asset.symbol}:`, error)
          return {
            symbol: asset.symbol,
            name: asset.symbol,
            type: asset.type,
            data: [],
            error: true,
          }
        }
      }),
    )

    return results
  } catch (error) {
    logError("Error fetching asset comparison data:", error)
    throw error
  }
}

// Get historical financial metrics
export async function getMetricTimeSeries(symbol: string, metrics: string[]): Promise<MetricTimeSeries[]> {
  // This is a mock implementation
  // In a real app, you would fetch historical financial data from an API

  const mockData: Record<string, MetricTimeSeries> = {
    pe: {
      metric: "P/E Ratio",
      data: Array.from({ length: 20 }, (_, i) => ({
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 15 + Math.sin(i) * 5,
      })),
    },
    eps: {
      metric: "EPS",
      data: Array.from({ length: 20 }, (_, i) => ({
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 2 + Math.cos(i) * 0.5,
      })),
    },
    evToEbitda: {
      metric: "EV/EBITDA",
      data: Array.from({ length: 20 }, (_, i) => ({
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 10 + Math.sin(i * 0.5) * 2,
      })),
    },
    profitMargin: {
      metric: "Profit Margin",
      data: Array.from({ length: 20 }, (_, i) => ({
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        value: 0.15 + Math.cos(i * 0.3) * 0.05,
      })),
    },
  }

  return metrics.map(
    (metric) =>
      mockData[metric] || {
        metric,
        data: [],
      },
  )
}

