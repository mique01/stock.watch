// Alpha Vantage API utilities
import type { StockQuote, StockOverview, TimeSeriesData, MarketIndex } from "../types/market-data"
import { logError } from "../utils"

const API_BASE_URL = "https://www.alphavantage.co/query"

// Generic endpoint fetcher
export async function fetchEndpoint<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey) {
    throw new Error("Alpha Vantage API key is not configured")
  }

  const queryParams = new URLSearchParams({
    ...params,
    apikey: apiKey,
  })

  const url = `${API_BASE_URL}?function=${endpoint}&${queryParams.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`)
    }

    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON but got ${contentType || "unknown content type"} from Alpha Vantage API`)
    }

    const data = await response.json()

    // Check for API error messages
    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
    }

    if (data["Information"]) {
      console.warn(`Alpha Vantage API info: ${data["Information"]}`)
      // If we get a message about API call frequency, throw an error to trigger fallback
      if (data["Information"].includes("call frequency")) {
        throw new Error(`Alpha Vantage API rate limit: ${data["Information"]}`)
      }
    }

    // Check if the response is empty or doesn't contain expected data
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`Empty response from Alpha Vantage API for ${endpoint}`)
    }

    return data as T
  } catch (error) {
    // Enhance error logging with more details
    if (error instanceof Error) {
      logError(`Alpha Vantage API error for ${endpoint} with params ${JSON.stringify(params)}: ${error.message}`, error)
    } else {
      logError(`Unknown error with Alpha Vantage API for ${endpoint}`, error)
    }
    throw error
  }
}

// Get stock quote
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    const data = await fetchEndpoint("GLOBAL_QUOTE", { symbol })

    const quote = data["Global Quote"]

    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No quote data found for symbol: ${symbol}`)
    }

    return {
      symbol,
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")) / 100,
      volume: Number.parseInt(quote["06. volume"], 10),
      latestTradingDay: quote["07. latest trading day"],
      previousClose: Number.parseFloat(quote["08. previous close"]),
      currency: "USD", // Alpha Vantage doesn't provide currency in GLOBAL_QUOTE
    }
  } catch (error) {
    logError(`Error fetching stock quote for ${symbol} from Alpha Vantage:`, error)
    throw error
  }
}

// Get company overview
export async function getStockOverview(symbol: string): Promise<StockOverview> {
  try {
    const data = await fetchEndpoint("OVERVIEW", { symbol })

    if (!data || Object.keys(data).length === 0 || !data.Symbol) {
      throw new Error(`No overview data found for symbol: ${symbol}`)
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      currency: data.Currency,
      country: data.Country,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: Number.parseFloat(data.MarketCapitalization),
      pe: Number.parseFloat(data.PERatio),
      eps: Number.parseFloat(data.EPS),
      beta: Number.parseFloat(data.Beta),
      high52Week: Number.parseFloat(data["52WeekHigh"]),
      low52Week: Number.parseFloat(data["52WeekLow"]),
      dividendYield: Number.parseFloat(data.DividendYield),
      dividendPerShare: Number.parseFloat(data.DividendPerShare),
      evToEbitda: Number.parseFloat(data.EVToEBITDA),
      profitMargin: Number.parseFloat(data.ProfitMargin),
      operatingMargin: Number.parseFloat(data.OperatingMarginTTM),
      returnOnAssets: Number.parseFloat(data.ReturnOnAssetsTTM),
      returnOnEquity: Number.parseFloat(data.ReturnOnEquityTTM),
      revenuePerShare: Number.parseFloat(data.RevenuePerShareTTM),
      priceToBook: Number.parseFloat(data.PriceToBookRatio),
      priceToSales: Number.parseFloat(data.PriceToSalesRatioTTM),
      website: data.Website,
    }
  } catch (error) {
    logError(`Error fetching stock overview for ${symbol} from Alpha Vantage:`, error)
    throw error
  }
}

// Get time series data
export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputSize = "compact",
): Promise<TimeSeriesData[]> {
  try {
    let endpoint: string
    let timeKey: string

    switch (interval) {
      case "1min":
        endpoint = "TIME_SERIES_INTRADAY"
        timeKey = "Time Series (1min)"
        break
      case "5min":
        endpoint = "TIME_SERIES_INTRADAY"
        timeKey = "Time Series (5min)"
        break
      case "15min":
        endpoint = "TIME_SERIES_INTRADAY"
        timeKey = "Time Series (15min)"
        break
      case "30min":
        endpoint = "TIME_SERIES_INTRADAY"
        timeKey = "Time Series (30min)"
        break
      case "60min":
        endpoint = "TIME_SERIES_INTRADAY"
        timeKey = "Time Series (60min)"
        break
      case "daily":
        endpoint = "TIME_SERIES_DAILY"
        timeKey = "Time Series (Daily)"
        break
      case "weekly":
        endpoint = "TIME_SERIES_WEEKLY"
        timeKey = "Weekly Time Series"
        break
      case "monthly":
        endpoint = "TIME_SERIES_MONTHLY"
        timeKey = "Monthly Time Series"
        break
      default:
        endpoint = "TIME_SERIES_DAILY"
        timeKey = "Time Series (Daily)"
    }

    const params: Record<string, string> = { symbol, outputsize: outputSize }

    if (endpoint === "TIME_SERIES_INTRADAY") {
      params.interval = interval
    }

    const data = await fetchEndpoint(endpoint, params)

    if (!data[timeKey] || Object.keys(data[timeKey]).length === 0) {
      throw new Error(`No time series data found for symbol: ${symbol}`)
    }

    const timeSeries = data[timeKey]

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"], 10),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    logError(`Error fetching time series for ${symbol} from Alpha Vantage:`, error)
    throw error
  }
}

// Get market indices
export async function getMarketIndices(): Promise<MarketIndex[]> {
  // Alpha Vantage doesn't have a direct endpoint for multiple indices
  // We'll fetch them individually
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
    logError("Error fetching market indices from Alpha Vantage:", error)
    throw error
  }
}

