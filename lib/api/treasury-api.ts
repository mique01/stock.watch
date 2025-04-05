// Treasury data API utilities
import type { TimeSeriesData } from "../types/market-data"
import { logError } from "../utils"

// Fetch treasury yield data from Alpha Vantage
export async function getTreasuryTimeSeries(maturity: string, interval = "daily"): Promise<TimeSeriesData[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY

    if (!apiKey) {
      throw new Error("Alpha Vantage API key is not configured")
    }

    const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=${interval}&maturity=${maturity}&apikey=${apiKey}`

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

    const timeSeriesKey = `data`

    if (!data[timeSeriesKey]) {
      throw new Error(`No time series data found for treasury: ${maturity}`)
    }

    const timeSeries = data[timeSeriesKey]

    return timeSeries
      .map((item: any) => ({
        date: item.date,
        open: Number.parseFloat(item.value),
        high: Number.parseFloat(item.value),
        low: Number.parseFloat(item.value),
        close: Number.parseFloat(item.value),
        volume: 0, // Treasuries don't have volume
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    logError(`Error fetching treasury data for ${maturity}:`, error)
    throw error
  }
}

// Get current treasury yield
export async function getTreasuryQuote(maturity: string): Promise<{
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}> {
  try {
    const timeSeries = await getTreasuryTimeSeries(maturity, "daily")

    // Sort by date descending to get the most recent data
    const sortedData = [...timeSeries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedData.length < 2) {
      throw new Error(`Insufficient data for treasury: ${maturity}`)
    }

    const latest = sortedData[0]
    const previous = sortedData[1]

    const change = latest.close - previous.close
    const changePercent = (change / previous.close) * 100

    return {
      symbol: `TREASURY_${maturity}`,
      name: `${maturity} Treasury Yield`,
      price: latest.close,
      change,
      changePercent,
      currency: "USD",
    }
  } catch (error) {
    logError(`Error fetching treasury quote for ${maturity}:`, error)
    throw error
  }
}

// Get available treasury maturities
export function getAvailableTreasuries() {
  return [
    { symbol: "3month", name: "3-Month Treasury" },
    { symbol: "5year", name: "5-Year Treasury" },
    { symbol: "7year", name: "7-Year Treasury" },
    { symbol: "10year", name: "10-Year Treasury" },
    { symbol: "30year", name: "30-Year Treasury" },
  ]
}

