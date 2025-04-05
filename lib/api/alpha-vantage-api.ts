// Alpha Vantage API utilities
import type { StockQuote, StockOverview, TimeSeriesData, MarketIndex } from "../types/market-data"
import { logError } from "../utils"

const API_BASE_URL = "https://www.alphavantage.co/query"

// Track API rate limit status
let API_RATE_LIMITED = false;
let RATE_LIMIT_DETECTED_AT: Date | null = null;
// Reset rate limit after 24 hours
const RATE_LIMIT_RESET_HOURS = 24;

// Alpha Vantage API response interfaces
interface AlphaVantageGlobalQuote {
  "Global Quote": {
    "01. symbol": string
    "02. open": string
    "03. high": string
    "04. low": string
    "05. price": string
    "06. volume": string
    "07. latest trading day": string
    "08. previous close": string
    "09. change": string
    "10. change percent": string
  }
}

interface AlphaVantageOverview {
  Symbol: string
  Name: string
  Description: string
  Exchange: string
  Currency: string
  Country: string
  Sector: string
  Industry: string
  MarketCapitalization: string
  PERatio: string
  EPS: string
  Beta: string
  "52WeekHigh": string
  "52WeekLow": string
  DividendYield: string
  DividendPerShare: string
  EVToEBITDA: string
  ProfitMargin: string
  OperatingMarginTTM: string
  ReturnOnAssetsTTM: string
  ReturnOnEquityTTM: string
  RevenuePerShareTTM: string
  PriceToBookRatio: string
  PriceToSalesRatioTTM: string
  Website: string
}

interface AlphaVantageTimeSeries {
  [timeKey: string]: {
    [date: string]: {
      "1. open": string
      "2. high": string
      "3. low": string
      "4. close": string
      "5. volume": string
    }
  }
}

// Generic endpoint fetcher
export async function fetchEndpoint<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  // Check if we're currently rate limited
  if (API_RATE_LIMITED) {
    // Check if enough time has passed to try again
    if (RATE_LIMIT_DETECTED_AT && 
        new Date().getTime() - RATE_LIMIT_DETECTED_AT.getTime() > RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000) {
      // Reset rate limit status if it's been more than the reset period
      console.log(`[Alpha Vantage] Rate limit reset after ${RATE_LIMIT_RESET_HOURS} hours. Attempting to use API again.`);
      API_RATE_LIMITED = false;
      RATE_LIMIT_DETECTED_AT = null;
    } else {
      // Still rate limited, throw error immediately
      const timeRemaining = RATE_LIMIT_DETECTED_AT 
        ? Math.round((RATE_LIMIT_RESET_HOURS * 60 * 60 * 1000 - (new Date().getTime() - RATE_LIMIT_DETECTED_AT.getTime())) / (60 * 60 * 1000))
        : RATE_LIMIT_RESET_HOURS;
      
      throw new Error(`Alpha Vantage API is rate limited. Using mock data. Rate limit resets in ~${timeRemaining} hours.`);
    }
  }

  // Obtain the Alpha Vantage API key
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  // Show more debugging information in development mode
  if (process.env.NODE_ENV === "development") {
    console.log(`[Alpha Vantage] Attempting to use API key: ${apiKey ? apiKey.substring(0, 4) + '...' : 'undefined'}`);
    console.log(`[Alpha Vantage] Environment variables:`, {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!apiKey
    });
  }

  if (!apiKey) {
    throw new Error("Alpha Vantage API key is not configured")
  }

  const queryParams = new URLSearchParams({
    ...params,
    apikey: apiKey,
  })

  const url = `${API_BASE_URL}?function=${endpoint}&${queryParams.toString()}`
  
  // Log the API URL (with API key partially hidden for security)
  const logSafeUrl = url.replace(apiKey, apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length - 3))
  console.log(`Making Alpha Vantage API call: ${logSafeUrl}`)

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      // Add a 30-second timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000)
    })

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

    // Check for "Note" field which often indicates a demo/free API key limitation
    if (data["Note"]) {
      console.warn(`Alpha Vantage API note: ${data["Note"]}`)
      if (data["Note"].includes("free API") || data["Note"].includes("standard API") || data["Note"].includes("API call frequency") || data["Note"].includes("limit")) {
        // Set rate limit status
        API_RATE_LIMITED = true;
        RATE_LIMIT_DETECTED_AT = new Date();
        console.warn(`[Alpha Vantage] Rate limit detected. Switching to mock data for the next ${RATE_LIMIT_RESET_HOURS} hours.`);
        throw new Error(`Alpha Vantage API key limitation: ${data["Note"]}`)
      }
    }

    if (data["Information"]) {
      console.warn(`Alpha Vantage API info: ${data["Information"]}`)
      // If we get a message about API call frequency, set rate limit status
      if (data["Information"].includes("call frequency") || data["Information"].includes("limit")) {
        API_RATE_LIMITED = true;
        RATE_LIMIT_DETECTED_AT = new Date();
        console.warn(`[Alpha Vantage] Rate limit detected. Switching to mock data for the next ${RATE_LIMIT_RESET_HOURS} hours.`);
        throw new Error(`Alpha Vantage API rate limit: ${data["Information"]}`)
      }
    }

    // Check if the response is empty or doesn't contain expected data
    if (!data || Object.keys(data).length === 0) {
      throw new Error(`Empty response from Alpha Vantage API for ${endpoint}`)
    }
    
    return data as T
  } catch (error) {
    // Check if this is a rate limit error
    if (error instanceof Error && 
        (error.message.includes("rate limit") || 
         error.message.includes("API call frequency") || 
         error.message.includes("API key limitation"))) {
      // Set rate limit status if not already set
      if (!API_RATE_LIMITED) {
        API_RATE_LIMITED = true;
        RATE_LIMIT_DETECTED_AT = new Date();
        console.warn(`[Alpha Vantage] Rate limit detected. Switching to mock data for the next ${RATE_LIMIT_RESET_HOURS} hours.`);
      }
    }
    
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
    console.log(`Fetching stock quote for symbol: ${symbol}`)
    const data = await fetchEndpoint<AlphaVantageGlobalQuote>("GLOBAL_QUOTE", { symbol })
    
    // Debug log to see the actual response
    console.log(`Alpha Vantage response for ${symbol}:`, JSON.stringify(data, null, 2))
    
    const quote = data["Global Quote"]

    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No quote data found for symbol: ${symbol}`)
    }

    // Create the stock quote object
    const stockQuote: StockQuote = {
      symbol,
      price: Number.parseFloat(quote["05. price"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")) / 100,
      volume: Number.parseInt(quote["06. volume"], 10),
      latestTradingDay: quote["07. latest trading day"],
      previousClose: Number.parseFloat(quote["08. previous close"]),
      currency: "USD", // Alpha Vantage doesn't provide currency in GLOBAL_QUOTE
    }
    
    // Debug log the processed data
    console.log(`Processed stock quote for ${symbol}:`, stockQuote)
    
    return stockQuote
  } catch (error) {
    logError(`Error fetching stock quote for ${symbol} from Alpha Vantage:`, error)
    throw error
  }
}

// Get company overview
export async function getStockOverview(symbol: string): Promise<StockOverview> {
  try {
    const data = await fetchEndpoint<AlphaVantageOverview>("OVERVIEW", { symbol })

    if (!data || Object.keys(data).length === 0 || !data.Symbol) {
      throw new Error(`No overview data found for symbol: ${symbol}`)
    }

    // First get the current quote to include price-related fields
    const quote = await getStockQuote(symbol)

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      exchange: data.Exchange,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
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

    const data = await fetchEndpoint<AlphaVantageTimeSeries>(endpoint, params)

    if (!data[timeKey] || Object.keys(data[timeKey]).length === 0) {
      throw new Error(`No time series data found for symbol: ${symbol}`)
    }

    const timeSeries = data[timeKey]

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        value: Number.parseFloat(values["4. close"]), // Using close price as the value
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

    // Ensure all results have a currency string
    const processedResults = results.map(result => ({
      ...result,
      currency: result.currency || "USD"
    }))

    return processedResults
  } catch (error) {
    logError("Error fetching market indices from Alpha Vantage:", error)
    throw error
  }
}

