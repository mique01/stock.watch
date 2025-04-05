"use client"

// Client-side Alpha Vantage API functions
// These are simplified mock implementations for the demo

export async function fetchStockQuote(symbol: string) {
  // In a real app, you would call your server API that fetches from Alpha Vantage
  // For demo purposes, we'll simulate a network request
  await new Promise((resolve) => setTimeout(resolve, 500))

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
  }
}

export async function fetchStockTimeSeries(symbol: string, timeframe: string) {
  // In a real app, you would call your server API that fetches from Alpha Vantage
  // For demo purposes, we'll simulate a network request and generate mock data
  await new Promise((resolve) => setTimeout(resolve, 800))

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
    })
  }

  return data
}

