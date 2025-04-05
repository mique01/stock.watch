import { NextResponse } from "next/server"
import * as marketData from "@/lib/services/market-data"
import { logError } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const symbol = searchParams.get("symbol")
  const timeframe = searchParams.get("timeframe")

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 })
  }

  try {
    let data

    switch (endpoint) {
      case "quote":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
        }
        data = await marketData.getStockQuote(symbol)
        break

      case "overview":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
        }
        data = await marketData.getStockOverview(symbol)
        break

      case "timeseries":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
        }
        data = await marketData.getTimeSeries(symbol, timeframe || "1M")
        break

      case "indices":
        data = await marketData.getMarketIndices()
        break

      default:
        return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    // Enhanced error logging and response
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logError(`Error in API route /api/market-data: ${errorMessage}`, error)

    // Provide a more detailed error response
    return NextResponse.json(
      {
        error: "Failed to fetch market data",
        message: errorMessage,
        endpoint,
        symbol,
        timeframe,
      },
      { status: 500 },
    )
  }
}

