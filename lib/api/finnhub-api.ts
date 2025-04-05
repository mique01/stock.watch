// Finnhub API utilities
import type { StockQuote, StockOverview, TimeSeriesData, MarketIndex } from "../types/market-data"
import { logError } from "../utils"

const API_BASE_URL = "https://finnhub.io/api/v1"

// Generic endpoint fetcher
export async function fetchEndpoint<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    throw new Error("Finnhub API key is not configured")
  }

  const queryParams = new URLSearchParams(params)

  const url = `${API_BASE_URL}/${endpoint}?${queryParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: {
        "X-Finnhub-Token": apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`)
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON but got ${contentType || "unknown content type"} from Finnhub API`)
    }

    const data = await response.json()

    // Check for API error responses
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`)
    }

    return data as T
  } catch (error) {
    // Enhance error logging with more details
    if (error instanceof Error) {
      logError(`Finnhub API error for ${endpoint} with params ${JSON.stringify(params)}: ${error.message}`, error)
    } else {
      logError(`Unknown error with Finnhub API for ${endpoint}`, error)
    }
    throw error
  }
}

// Get stock quote
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const data = await fetchEndpoint("quote", { symbol })

    if (!data || data.c === undefined) {
      throw new Error(`No quote data found for symbol: ${symbol}`)
    }

    // Get company profile to get the name
    const profile = await fetchEndpoint("stock/profile2", { symbol })

    return {
      symbol,
      price: data.c, // Current price
      change: data.d, // Change
      changePercent: data.dp / 100, // Change percent
      volume: data.v, // Volume
      previousClose: data.pc, // Previous close
      latestTradingDay: new Date().toISOString().split("T")[0], // Finnhub doesn't provide this directly
      currency: profile.currency || "USD",
    }
  } catch (error) {
    logError(`Error fetching stock quote for ${symbol} from Finnhub:`, error)
    throw error
  }
}

// Get company overview
export async function getStockOverview(symbol: string): Promise<StockOverview> {
  try {
    // Finnhub requires multiple API calls to get all the data we need
    const [profile, metrics] = await Promise.all([
      fetchEndpoint("stock/profile2", { symbol }),
      fetchEndpoint("stock/metric", { symbol, metric: "all" }),
    ])

    if (!profile || !profile.name) {
      throw new Error(`No profile data found for symbol: ${symbol}`)
    }

    return {
      symbol,
      name: profile.name,
      description: profile.description || "",
      exchange: profile.exchange || "",
      currency: profile.currency || "USD",
      country: profile.country || "",
      sector: profile.finnhubIndustry || "",
      industry: profile.finnhubIndustry || "",
      marketCap: profile.marketCapitalization * 1000000 || 0, // Convert to full value
      pe: metrics.metric?.peBasicExcl || 0,
      eps: metrics.metric?.epsBasicExcl || 0,
      beta: metrics.metric?.beta || 0,
      high52Week: metrics.metric?.["52WeekHigh"] || 0,
      low52Week: metrics.metric?.["52WeekLow"] || 0,
      dividendYield: metrics.metric?.dividendYieldIndicatedAnnual || 0,
      dividendPerShare: metrics.metric?.dividendPerShareAnnual || 0,
      evToEbitda: metrics.metric?.evToEbitda || 0,
      profitMargin: metrics.metric?.netProfitMargin || 0,
      operatingMargin: metrics.metric?.operatingMargin || 0,
      returnOnAssets: metrics.metric?.roa || 0,
      returnOnEquity: metrics.metric?.roe || 0,
      revenuePerShare: metrics.metric?.revenuePerShare || 0,
      priceToBook: metrics.metric?.pbQuarterly || 0,
      priceToSales: metrics.metric?.psQuarterly || 0,
      website: profile.weburl || "",
    }
  } catch (error) {
    logError(`Error fetching stock overview for ${symbol} from Finnhub:`, error)
    throw error
  }
}

// Get time series data
export async function getTimeSeries(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
): Promise<TimeSeriesData[]> {
  try {
    const data = await fetchEndpoint("stock/candle", {
      symbol,
      resolution,
      from,
      to,
    })

    if (!data || !data.c || data.s === "no_data") {
      throw new Error(`No candle data found for symbol: ${symbol}`)
    }

    // Finnhub returns data in arrays
    const { c, h, l, o, t, v } = data

    return t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      open: o[index],
      high: h[index],
      low: l[index],
      close: c[index],
      volume: v[index],
    }))
  } catch (error) {
    logError(`Error fetching time series for ${symbol} from Finnhub:`, error)
    throw error
  }
}

// Get market indices
export async function getMarketIndices(): Promise<MarketIndex[]> {
  // Finnhub doesn't have a direct endpoint for indices
  // We'll use the same approach as Alpha Vantage
  const indices = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^DJI", name: "Dow Jones" },
    { symbol: "^IXIC", name: "NASDAQ" },
    { symbol: "^FTSE", name: "FTSE 100" },
    { symbol: "^N225", name: "Nikkei 225" },
    { symbol: "^HSI", name: "Hang Seng" },
  ]

  try {
    const results = await Promise.all(
      indices.map(async (index) => {
        try {
          const quote = await getStockQuote(index.symbol)
          return {
            symbol: index.symbol,
            name: index.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            currency: quote.currency,
          }
        } catch (error) {
          logError(`Error fetching index ${index.symbol}:`, error)
          // Return a placeholder with error status
          return {
            symbol: index.symbol,
            name: index.name,
            price: 0,
            change: 0,
            changePercent: 0,
            currency: "USD",
            error: true,
          }
        }
      }),
    )

    return results
  } catch (error) {
    logError("Error fetching market indices from Finnhub:", error)
    throw error
  }
}

