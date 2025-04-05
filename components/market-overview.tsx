"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

// TypeScript interfaces for recharts tooltip
type TooltipFormatter = (value: number, name: string, props: any) => [string, string];
type LabelFormatter = (label: string) => string;

type IndexData = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency?: string
  previousClose?: number
  open?: number
  dayHigh?: number
  dayLow?: number
  yearHigh?: number
  yearLow?: number
  chartData?: { time: string; value: number }[]
  isLoading?: boolean
  error?: boolean
  isMockData?: boolean
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const majorIndices = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^DJI", name: "Dow Jones" },
    { symbol: "^IXIC", name: "NASDAQ" },
    { symbol: "^VIX", name: "VIX" },
    { symbol: "DX-Y.NYB", name: "US Dollar" },
  ]

  const fetchMarketData = async () => {
    setIsLoading(true)
    setError(null)
    
    // Initialize with loading state
    setIndices(majorIndices.map(index => ({
      ...index,
      price: 0,
      change: 0,
      changePercent: 0,
      currency: "USD",
      isLoading: true
    })))
    
    try {
      // Fetch from our /api/market-data endpoint which uses the real Alpha Vantage API
      const response = await fetch('/api/market-data?endpoint=indices')
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data) && data.length > 0) {
        // Map the API response to our component state
        const formattedData = data.map(item => {
          // Find the matching index in our predefined list to preserve names
          const matchedIndex = majorIndices.find(idx => idx.symbol === item.symbol)
          
          // Check if mock data is being used
          const isMockData = item.isMockData === true;
          
          return {
            symbol: item.symbol,
            name: matchedIndex?.name || item.name, // Use our custom name if available
            price: item.price,
            change: item.change,
            changePercent: item.changePercent,
            currency: item.currency || "USD",
            chartData: generateMockChartData(item.price, item.changePercent),
            isLoading: false,
            error: false,
            isMockData
          }
        })
        
        // Check if all data is mock data
        const allMockData = formattedData.every(item => item.isMockData === true);
        if (allMockData) {
          setError("Using simulated data. API rate limit reached.");
        } else if (formattedData.some(item => item.isMockData === true)) {
          setError("Some data points are simulated due to API limitations.");
        }
        
        setIndices(formattedData)
        setLastUpdated(new Date())
      } else {
        throw new Error("Invalid data format received from API")
      }
    } catch (error) {
      console.error("Failed to fetch market data:", error)
      
      let errorMessage = "Failed to fetch market data. Using simulated data.";
      
      // Check for rate limit errors
      if (error instanceof Error && error.message.includes("rate limit")) {
        errorMessage = "API rate limit reached. Using simulated data.";
      }
      
      setError(errorMessage)
      
      // Generate mock data for demonstration
      const mockData = generateMockIndicesData()
      setIndices(mockData)
      setLastUpdated(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  // Generate mock data for development or when API fails
  const generateMockIndicesData = (): IndexData[] => {
    return majorIndices.map(index => {
      // Generate realistic baseline values for each index
      let basePrice = 0
      switch (index.symbol) {
        case "^GSPC": // S&P 500
          basePrice = 4500 + Math.random() * 200 - 100
          break
        case "^DJI": // Dow Jones
          basePrice = 35000 + Math.random() * 1000 - 500
          break
        case "^IXIC": // NASDAQ
          basePrice = 14000 + Math.random() * 800 - 400
          break
        case "^VIX": // VIX
          basePrice = 15 + Math.random() * 8 - 4
          break
        case "DX-Y.NYB": // US Dollar Index
          basePrice = 95 + Math.random() * 6 - 3
          break
        default:
          basePrice = 100 + Math.random() * 20 - 10
      }
      
      // Generate change values
      const changePercent = (Math.random() * 4 - 2) // -2% to +2%
      const change = basePrice * (changePercent / 100)
      
      return {
        symbol: index.symbol,
        name: index.name,
        price: basePrice,
        change: change,
        changePercent: changePercent,
        currency: "USD",
        previousClose: basePrice - change,
        open: basePrice - (change * 0.5),
        dayHigh: basePrice + (Math.abs(change) * 0.5),
        dayLow: basePrice - (Math.abs(change) * 0.5),
        yearHigh: basePrice * 1.2,
        yearLow: basePrice * 0.8,
        chartData: generateMockChartData(basePrice, changePercent),
        isLoading: false,
        error: false,
        isMockData: false
      }
    })
  }

  // Generate mock chart data for the day
  const generateMockChartData = (currentPrice: number, changePercent: number) => {
    const data = []
    const now = new Date()
    const marketOpen = new Date(now)
    marketOpen.setHours(9, 30, 0, 0)
    
    const hoursToSimulate = 6.5 // Market hours 9:30 AM - 4:00 PM
    const pointsPerHour = 12 // 5-minute intervals
    const totalPoints = hoursToSimulate * pointsPerHour
    
    // Determine if trend is up or down based on change percent
    const trendUp = changePercent >= 0
    
    // Calculate starting price (before market open)
    const startPrice = currentPrice - (currentPrice * (changePercent / 100))
    
    // Add some volatility with an overall trend matching the daily change
    for (let i = 0; i < totalPoints; i++) {
      const time = new Date(marketOpen)
      time.setMinutes(marketOpen.getMinutes() + (i * 5))
      
      // Calculate progress through the day (0 to 1)
      const progress = i / totalPoints
      
      // Add some random noise but keep the general trend
      const trendComponent = trendUp
        ? progress * (changePercent / 100) * currentPrice
        : (1 - progress) * (changePercent / 100) * currentPrice * -1
      
      // Add volatility that's proportional to the price
      const volatility = currentPrice * 0.001 // 0.1% of price
      const noise = (Math.random() - 0.5) * volatility * 2
      
      const value = startPrice + trendComponent + noise
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: Math.max(0, value)
      })
    }
    
    return data
  }

  useEffect(() => {
    fetchMarketData()
    
    // Set up auto-refresh interval (every 5 minutes)
    const intervalId = setInterval(fetchMarketData, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = () => {
    fetchMarketData()
  }

  // Filter indices based on active tab
  const getFilteredIndices = () => {
    if (activeTab === "all") {
      return indices
    } else if (activeTab === "us") {
      return indices.filter(index => ["^GSPC", "^DJI", "^IXIC"].includes(index.symbol))
    } else if (activeTab === "volatility") {
      return indices.filter(index => ["^VIX", "DX-Y.NYB"].includes(index.symbol))
    }
    return indices
  }

  const filteredIndices = getFilteredIndices()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Market Overview</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Badge className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
            {error}
          </Badge>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="us">US Indices</TabsTrigger>
            <TabsTrigger value="volatility">Volatility & Currency</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="h-[220px] animate-pulse bg-muted/20"></Card>
                ))
              ) : (
                filteredIndices.map((index) => (
                  <Card key={index.symbol} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm text-muted-foreground">{index.name}</h3>
                            {index.isMockData && (
                              <Badge className="text-[10px] h-4 bg-blue-50 text-blue-600 border-blue-200">
                                Sim
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">
                              {formatCurrency(index.price, index.currency)}
                            </span>
                            <div className={`flex items-center ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {index.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                              <span className="font-medium">
                                {formatCurrency(Math.abs(index.change), index.currency)} ({formatPercentage(Math.abs(index.changePercent) / 100)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={index.chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 10 }}
                              interval="preserveStartEnd"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              domain={['dataMin', 'dataMax']}
                              hide={true}
                            />
                            <Tooltip
                              formatter={(value: number) => [formatCurrency(value, index.currency), "Value"]}
                              labelFormatter={(label: string) => `Time: ${label}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={index.change >= 0 ? "#10b981" : "#ef4444"}
                              dot={false}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs border-t">
                        <div>
                          <span className="text-muted-foreground">Open</span>
                          <p className="font-medium">{formatCurrency(index.open || 0, index.currency)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Day Range</span>
                          <p className="font-medium">
                            {formatCurrency(index.dayLow || 0, index.currency)} - {formatCurrency(index.dayHigh || 0, index.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prev Close</span>
                          <p className="font-medium">{formatCurrency(index.previousClose || 0, index.currency)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

