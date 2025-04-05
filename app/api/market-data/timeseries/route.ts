import { NextRequest, NextResponse } from "next/server"
import { getTimeSeries } from "@/lib/services/market-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")
  const interval = searchParams.get("interval") as "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y" | undefined

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    )
  }

  try {
    const data = await getTimeSeries(symbol, interval || "1Y")
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch time series data" },
      { status: 500 }
    )
  }
} 