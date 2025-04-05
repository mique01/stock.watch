// Server-side Alpha Vantage API functions

export async function fetchMarketIndices() {
  // In a real app, you would fetch this from Alpha Vantage
  // For demo purposes, we'll return mock data
  return [
    {
      symbol: "^GSPC",
      name: "S&P 500",
      price: 5021.84,
      change: 15.29,
      changePercent: 0.31,
      currency: "USD",
    },
    {
      symbol: "^DJI",
      name: "Dow Jones",
      price: 38671.69,
      change: 125.69,
      changePercent: 0.33,
      currency: "USD",
    },
    {
      symbol: "^IXIC",
      name: "NASDAQ",
      price: 15990.66,
      change: 64.64,
      changePercent: 0.41,
      currency: "USD",
    },
    {
      symbol: "^FTSE",
      name: "FTSE 100",
      price: 7648.98,
      change: -28.31,
      changePercent: -0.37,
      currency: "GBP",
    },
    {
      symbol: "^N225",
      name: "Nikkei 225",
      price: 35751.42,
      change: -192.79,
      changePercent: -0.54,
      currency: "JPY",
    },
    {
      symbol: "^HSI",
      name: "Hang Seng",
      price: 16788.55,
      change: 57.34,
      changePercent: 0.34,
      currency: "HKD",
    },
  ]
}

export async function fetchStockQuote(symbol: string) {
  // In a real app, you would fetch this from Alpha Vantage API
  // For demo purposes, we'll return mock data based on the symbol

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

export async function fetchStockOverview(symbol: string) {
  // In a real app, you would fetch this from Alpha Vantage API
  // For demo purposes, we'll return mock data

  // Generate a somewhat realistic market cap based on the symbol
  const basePrice = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const price = (basePrice % 1000) + 50
  const marketCap = price * (Math.floor(Math.random() * 1000000000) + 1000000000)

  return {
    symbol,
    name: `${symbol} Inc.`,
    description: `${symbol} Inc. is a leading company in the technology sector, specializing in innovative solutions for businesses and consumers worldwide. The company was founded in 2005 and has since grown to become a major player in its industry.`,
    exchange: "NASDAQ",
    currency: "USD",
    country: "USA",
    sector: "Technology",
    industry: "Software",
    marketCap,
    pe: 25 + Math.random() * 10,
    eps: 5 + Math.random() * 3,
    beta: 1 + Math.random(),
    high52Week: price * 1.2,
    low52Week: price * 0.8,
    dividendYield: Math.random() * 0.03,
    dividendPerShare: Math.random() * 2,
    evToEbitda: 15 + Math.random() * 5,
    profitMargin: 0.15 + Math.random() * 0.1,
    operatingMargin: 0.2 + Math.random() * 0.15,
    returnOnAssets: 0.1 + Math.random() * 0.05,
    returnOnEquity: 0.15 + Math.random() * 0.1,
    revenuePerShare: 20 + Math.random() * 10,
    priceToBook: 3 + Math.random() * 2,
    priceToSales: 5 + Math.random() * 3,
    website: `https://www.${symbol.toLowerCase()}.com`,
  }
}

