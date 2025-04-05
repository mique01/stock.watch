import { NextRequest, NextResponse } from "next/server"
import { getMetricTimeSeries } from "@/lib/services/market-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")
  const metricsParam = searchParams.get("metrics")

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    )
  }

  // Parse metrics from comma-separated string
  const metrics = metricsParam ? metricsParam.split(",") : ["pe", "eps"]

  try {
    const data = await getMetricTimeSeries(symbol, metrics)
    
    // Transform the data into a format easier to use in the frontend
    const formattedData: Record<string, { date: string; value: number }[]> = {}
    
    data.forEach(metricData => {
      formattedData[metricData.metric] = metricData.data
    })
    
    return NextResponse.json(formattedData)
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch metrics data" },
      { status: 500 }
    )
  }
} 