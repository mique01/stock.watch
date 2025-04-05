"use client"

// Client-side Alpha Vantage API functions
// These will try to fetch real data first, then fall back to mock data

// Function to fetch data from our server-side API endpoints
async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`/api/market-data/${endpoint}?${queryString}`, {
      // Agregar un timeout para evitar peticiones que nunca terminan
      signal: AbortSignal.timeout(10000) // 10 segundos de timeout
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || 
        errorData.error || 
        `API request failed with status ${response.status}`
      )
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching from API (${endpoint}):`, error)
    throw error
  }
}

export async function fetchStockQuote(symbol: string) {
  try {
    // First try to get real data from our API
    console.log(`Attempting to fetch real quote data for ${symbol}`)
    const data = await fetchFromApi('quote', { symbol })
    console.log(`Successfully fetched real quote data for ${symbol}`)
    return data
  } catch (error) {
    console.warn(`Falling back to mock data for ${symbol} quote:`, error)
    
    // Fall back to mock data
    // Generate a somewhat realistic price based on the symbol's character codes
    const basePrice = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

    const price = (basePrice % 1000) + 50 + Math.random() * 10
    const change = Math.random() * 10 - 5
    const changePercent = (change / price) * 100

    return {
      symbol,
      name: `${symbol} Inc.`,
      price,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      currency: "USD",
      isMockData: true // Flag to indicate this is mock data
    }
  }
}

export async function fetchStockTimeSeries(symbol: string, timeframe: string) {
  try {
    // Convert client timeframe format to API format
    let interval
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
        outputSize = "full"
        break
      case "1Y":
        interval = "weekly"
        break
      case "5Y":
        interval = "monthly"
        break
      default:
        interval = "daily"
    }
    
    // First try to get real data from our API
    console.log(`Attempting to fetch real time series data for ${symbol} (${timeframe})`)
    const data = await fetchFromApi('timeseries', { 
      symbol, 
      interval,
      outputSize
    })
    
    // Transform the data to match expected format
    if (Array.isArray(data)) {
      const formattedData = data.map((item: any) => ({
        date: item.date,
        price: item.close || item.price, // Use closing price or price if available
        isMockData: item.isMockData || false
      }))
      
      console.log(`Successfully fetched time series data for ${symbol} (${timeframe})`)
      return formattedData
    } else {
      console.error(`Unexpected data format for time series:`, data)
      throw new Error('Unexpected data format from API')
    }
  } catch (error) {
    console.warn(`Falling back to mock data for ${symbol} time series:`, error)
    
    // Fall back to mock data generation
    // Generate a base price from the symbol
    const basePrice = (symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000) + 50

    // Generate different data points based on the timeframe
    let dataPoints = 0
    const startDate = new Date()
    let volatility = 0

    switch (timeframe) {
      case "1D":
        dataPoints = 24
        startDate.setHours(startDate.getHours() - 24)
        volatility = 0.005
        break
      case "1W":
        dataPoints = 7
        startDate.setDate(startDate.getDate() - 7)
        volatility = 0.01
        break
      case "1M":
        dataPoints = 30
        startDate.setMonth(startDate.getMonth() - 1)
        volatility = 0.02
        break
      case "3M":
        dataPoints = 90
        startDate.setMonth(startDate.getMonth() - 3)
        volatility = 0.03
        break
      case "1Y":
        dataPoints = 250
        startDate.setFullYear(startDate.getFullYear() - 1)
        volatility = 0.05
        break
      case "5Y":
        dataPoints = 60
        startDate.setFullYear(startDate.getFullYear() - 5)
        volatility = 0.1
        break
      default:
        dataPoints = 30
        startDate.setMonth(startDate.getMonth() - 1)
        volatility = 0.02
    }

    // Generate the time series data
    const data = []
    let currentPrice = basePrice

    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(startDate)

      if (timeframe === "1D") {
        date.setHours(date.getHours() + i)
      } else if (timeframe === "1W") {
        date.setDate(date.getDate() + i)
      } else if (timeframe === "1M" || timeframe === "3M") {
        date.setDate(date.getDate() + i)
      } else if (timeframe === "1Y") {
        date.setDate(date.getDate() + i)
      } else if (timeframe === "5Y") {
        date.setMonth(date.getMonth() + i)
      }

      // Add some randomness to the price
      const change = currentPrice * (Math.random() * volatility * 2 - volatility)
      currentPrice += change

      data.push({
        date: date.toISOString(),
        price: Math.max(1, currentPrice),
        isMockData: true // Flag to indicate this is mock data
      })
    }

    return data
  }
}

