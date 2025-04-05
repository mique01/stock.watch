// Commodity data API utilities
import type { TimeSeriesData } from "../types/market-data"
import { logError } from "../utils"

// Fetch commodity data from Alpha Vantage
export async function getCommodityTimeSeries(symbol: string, interval = "monthly"): Promise<TimeSeriesData[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY

    if (!apiKey) {
      throw new Error("Alpha Vantage API key is not configured")
    }

    // Map commodity symbols to Alpha Vantage functions
    const commodityFunctions: Record<string, string> = {
      WTI: "WTI", // Crude Oil (WTI)
      BRENT: "BRENT", // Crude Oil (Brent)
      NATURAL_GAS: "NATURAL_GAS",
      COPPER: "COPPER",
      ALUMINUM: "ALUMINUM",
      WHEAT: "WHEAT",
      CORN: "CORN",
      COTTON: "COTTON",
      SUGAR: "SUGAR",
      COFFEE: "COFFEE",
      GOLD: "GOLD",
      SILVER: "SILVER",
    }

    const function_name = commodityFunctions[symbol]

    if (!function_name) {
      throw new Error(`Unsupported commodity symbol: ${symbol}`)
    }

    const url = `https://www.alphavantage.co/query?function=${function_name}&interval=${interval}&apikey=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check for API error messages
    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API error: ${data["Error Message"]}`)
    }

    if (data["Information"]) {
      console.warn(`Alpha Vantage API info: ${data["Information"]}`)
    }

    const timeSeriesKey = `Time Series (${interval})`

    if (!data[timeSeriesKey]) {
      throw new Error(`No time series data found for commodity: ${symbol}`)
    }

    const timeSeries = data[timeSeriesKey]

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: 0, // Commodities don't have volume in Alpha Vantage
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    logError(`Error fetching commodity data for ${symbol}:`, error)
    throw error
  }
}

// Get current commodity price
export async function getCommodityQuote(symbol: string): Promise<{
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}> {
  try {
    const timeSeries = await getCommodityTimeSeries(symbol, "daily")

    // Sort by date descending to get the most recent data
    const sortedData = [...timeSeries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedData.length < 2) {
      throw new Error(`Insufficient data for commodity: ${symbol}`)
    }

    const latest = sortedData[0]
    const previous = sortedData[1]

    const commodityNames: Record<string, string> = {
      WTI: "Crude Oil (WTI)",
      BRENT: "Crude Oil (Brent)",
      NATURAL_GAS: "Natural Gas",
      COPPER: "Copper",
      ALUMINUM: "Aluminum",
      WHEAT: "Wheat",
      CORN: "Corn",
      COTTON: "Cotton",
      SUGAR: "Sugar",
      COFFEE: "Coffee",
      GOLD: "Gold",
      SILVER: "Silver",
    }

    const change = latest.close - previous.close
    const changePercent = (change / previous.close) * 100

    return {
      symbol,
      name: commodityNames[symbol] || symbol,
      price: latest.close,
      change,
      changePercent,
      currency: "USD",
    }
  } catch (error) {
    logError(`Error fetching commodity quote for ${symbol}:`, error)
    throw error
  }
}

// Get available commodities
export function getAvailableCommodities() {
  return [
    { symbol: "WTI", name: "Crude Oil (WTI)" },
    { symbol: "BRENT", name: "Crude Oil (Brent)" },
    { symbol: "NATURAL_GAS", name: "Natural Gas" },
    { symbol: "COPPER", name: "Copper" },
    { symbol: "ALUMINUM", name: "Aluminum" },
    { symbol: "WHEAT", name: "Wheat" },
    { symbol: "CORN", name: "Corn" },
    { symbol: "COTTON", name: "Cotton" },
    { symbol: "SUGAR", name: "Sugar" },
    { symbol: "COFFEE", name: "Coffee" },
    { symbol: "GOLD", name: "Gold" },
    { symbol: "SILVER", name: "Silver" },
  ]
}

