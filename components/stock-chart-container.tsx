"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchStockTimeSeries } from "@/lib/alpha-vantage-client"
import StockChart from "./stock-chart"
// Import the DataErrorFallback component
import DataErrorFallback from "./data-error-fallback"

type StockChartContainerProps = {
  symbol: string
}

export default function StockChartContainer({ symbol }: StockChartContainerProps) {
  const [timeframe, setTimeframe] = useState("1D")
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchStockTimeSeries(symbol, timeframe)
        setTimeSeriesData(data)
      } catch (error) {
        console.error("Failed to fetch time series data:", error)
        setTimeSeriesData([])
        setError(error instanceof Error ? error.message : "Failed to fetch chart data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol, timeframe])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Price Chart</CardTitle>
        <div className="flex gap-1">
          {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">Loading chart data...</div>
        ) : error ? (
          <div className="h-[400px] overflow-auto">
            <DataErrorFallback
              message={error}
              onRetry={() =>
                fetchStockTimeSeries(symbol, timeframe)
                  .then((data) => {
                    setTimeSeriesData(data)
                    setError(null)
                  })
                  .catch((err) => setError(err.message))
              }
            />
          </div>
        ) : timeSeriesData.length > 0 ? (
          <StockChart data={timeSeriesData} symbol={symbol} />
        ) : (
          <div className="h-[400px] flex items-center justify-center">No data available for the selected timeframe</div>
        )}
      </CardContent>
    </Card>
  )
}

