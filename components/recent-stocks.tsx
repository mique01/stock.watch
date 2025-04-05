"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchStockTimeSeries } from "@/lib/alpha-vantage-client"
import StockChart from "./stock-chart"

const POPULAR_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN"]

export default function RecentStocks() {
  const [activeStock, setActiveStock] = useState(POPULAR_STOCKS[0])
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchStockTimeSeries(activeStock, "1D")
        setTimeSeriesData(data)
      } catch (error) {
        console.error("Failed to fetch time series data:", error)
        setTimeSeriesData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeStock])

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Popular Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={POPULAR_STOCKS[0]} value={activeStock} onValueChange={setActiveStock}>
          <TabsList className="mb-4">
            {POPULAR_STOCKS.map((symbol) => (
              <TabsTrigger key={symbol} value={symbol}>
                {symbol}
              </TabsTrigger>
            ))}
          </TabsList>
          {POPULAR_STOCKS.map((symbol) => (
            <TabsContent key={symbol} value={symbol}>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">Loading chart data...</div>
              ) : timeSeriesData.length > 0 ? (
                <StockChart data={timeSeriesData} symbol={symbol} />
              ) : (
                <div className="h-[300px] flex items-center justify-center">No data available</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

