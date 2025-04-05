"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StockOverview } from "@/lib/types/market-data"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts"

interface StockChartProps {
  symbol: string
  stockInfo: StockOverview
}

export default function StockChart({ symbol, stockInfo }: StockChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "5Y">("1Y")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChartData() {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/market-data/timeseries?symbol=${symbol}&interval=${timeframe}`)
        
        if (!response.ok) {
          throw new Error(`Error fetching chart data: ${response.statusText}`)
        }
        
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch chart data")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchChartData()
  }, [symbol, timeframe])

  function handleTimeframeChange(value: string) {
    setTimeframe(value as "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y")
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-4">
            <CardTitle className="text-2xl">
              {formatCurrency(stockInfo.price, stockInfo.currency)}
            </CardTitle>
            <div className={`flex items-center ${stockInfo.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stockInfo.change >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="font-medium">
                {formatCurrency(Math.abs(stockInfo.change), stockInfo.currency)} ({formatPercentage(Math.abs(stockInfo.changePercent) / 100)})
              </span>
            </div>
          </div>
          
          <Tabs value={timeframe} onValueChange={handleTimeframeChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="3M">3M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="5Y">5Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <p>Cargando datos del gráfico...</p>
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => {
                    // Format date based on timeframe
                    const dateObj = new Date(date)
                    if (timeframe === "1D") {
                      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    } else if (timeframe === "1W" || timeframe === "1M") {
                      return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
                    } else {
                      return dateObj.toLocaleDateString([], { month: 'short', year: '2-digit' })
                    }
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => formatCurrency(value, stockInfo.currency, { notation: 'compact' })}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value), stockInfo.currency), "Precio"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString([], {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                />
                <ReferenceLine 
                  y={stockInfo.price - stockInfo.change} 
                  stroke="#888888" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: "Precio anterior", 
                    position: "insideBottomLeft",
                    fill: "#888888",
                    fontSize: 12
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={stockInfo.change >= 0 ? "#10b981" : "#ef4444"} 
                  dot={false}
                  strokeWidth={2}
                />
                {(timeframe === "1Y" || timeframe === "5Y") && (
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#8884d8"
                    tickFormatter={(date) => {
                      const dateObj = new Date(date)
                      return dateObj.toLocaleDateString([], { month: 'short', year: '2-digit' })
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

