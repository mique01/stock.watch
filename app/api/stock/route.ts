import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")
  const function_name = searchParams.get("function") || "GLOBAL_QUOTE"

  if (!symbol) {
    return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    const url = `https://www.alphavantage.co/query?function=${function_name}&symbol=${symbol}&apikey=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch data from Alpha Vantage" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

