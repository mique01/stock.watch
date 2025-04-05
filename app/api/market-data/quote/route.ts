export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return Response.json({ error: "Symbol parameter is required" }, { status: 400 })
  }

  try {
    // Log the request for debugging
    console.log(`Processing quote request for symbol: ${symbol}`)
    
    // Import services directly in the route handler
    const { getStockOverview } = await import("@/lib/services/market-data")
    const { logError } = await import("@/lib/utils")
    
    const stockData = await getStockOverview(symbol)
    
    if (!stockData) {
      return Response.json({ error: "No data found for symbol" }, { status: 404 })
    }
    
    // Extract just the quote data
    const quoteData = {
      price: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent,
      currency: stockData.currency,
      previousClose: stockData.previousClose,
      volume: stockData.volume,
      latestTradingDay: stockData.latestTradingDay
    }
    
    return Response.json(quoteData)
  } catch (error) {
    // Import logError directly in the catch block
    const { logError } = await import("@/lib/utils")
    
    // Enhanced error logging and response
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logError(`Error in API route /api/market-data/quote: ${errorMessage}`, error)

    // Check for specific error messages
    let statusCode = 500
    let errorResponse = {
      error: "Failed to fetch stock quote",
      message: errorMessage,
      symbol,
    }
    
    if (errorMessage.includes("API key") || errorMessage.includes("rate limit")) {
      statusCode = 429
      errorResponse.error = "API rate limit exceeded"
    } else if (errorMessage.includes("No quote data found")) {
      statusCode = 404
      errorResponse.error = "Stock symbol not found"
    }

    return Response.json(errorResponse, { status: statusCode })
  }
} 