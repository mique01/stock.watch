"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchStockTimeSeries } from "@/lib/alpha-vantage-client"
import StockChart from "./stock-chart"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const POPULAR_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN"]

export default function RecentStocks() {
  const [activeStock, setActiveStock] = useState(POPULAR_STOCKS[0])
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      setIsMockData(false)
      
      try {
        console.log(`Fetching data for ${activeStock}...`)
        const data = await fetchStockTimeSeries(activeStock, "1D")
        
        // Check if this is mock data
        setIsMockData(data.length > 0 && 'isMockData' in data[0] && data[0].isMockData === true)
        
        setTimeSeriesData(data)
      } catch (error) {
        console.error("Failed to fetch time series data:", error)
        setTimeSeriesData([])
        setError(error instanceof Error ? error.message : "Failed to fetch stock data")
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
        {isMockData && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Showing simulated data. Connect API keys for real-time market data.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
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

