"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StockOverview } from "@/lib/types/market-data"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ComposedChart,
  Bar,
  Area
} from "recharts"
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils"
import { Check, BarChart2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

type StockMetricsComparisonProps = {
  symbol: string
  stockInfo: StockOverview
}

type MetricData = {
  date: string
  value: number
}

type DisplayMode = "chart" | "table" | "cards"

export default function StockMetricsComparison({ symbol, stockInfo }: StockMetricsComparisonProps) {
  const [metricsData, setMetricsData] = useState<Record<string, MetricData[]>>({})
  const [priceData, setPriceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [displayMode, setDisplayMode] = useState<DisplayMode>("chart")
  const [combinedWithPrice, setCombinedWithPrice] = useState(true)
  const [timeframe, setTimeframe] = useState("5Y")

  const availableMetrics = [
    { id: "pe", name: "P/E Ratio", color: "#8884d8", format: "number" },
    { id: "eps", name: "EPS", color: "#82ca9d", format: "currency" },
    { id: "dividendYield", name: "Dividend Yield", color: "#ffc658", format: "percent" },
    { id: "profitMargin", name: "Profit Margin", color: "#ff8042", format: "percent" },
    { id: "operatingMargin", name: "Operating Margin", color: "#0088FE", format: "percent" },
    { id: "returnOnEquity", name: "ROE", color: "#00C49F", format: "percent" },
    { id: "returnOnAssets", name: "ROA", color: "#FFBB28", format: "percent" },
    { id: "priceToBook", name: "P/B Ratio", color: "#FF8042", format: "number" },
    { id: "priceToSales", name: "P/S Ratio", color: "#a4de6c", format: "number" },
    { id: "evToEbitda", name: "EV/EBITDA", color: "#d0ed57", format: "number" },
  ]

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch historical price data
        const priceResponse = await fetch(`/api/market-data/timeseries?symbol=${symbol}&interval=monthly`)
        const priceData = await priceResponse.json()
        
        // Fetch historical metrics data
        const metrics = availableMetrics.map(metric => metric.id)
        const metricsResponse = await fetch(`/api/market-data/metrics?symbol=${symbol}&metrics=${metrics.join(",")}`)
        const metricsData = await metricsResponse.json()
        
        setPriceData(priceData)
        setMetricsData(metricsData)
        
        // Auto-select first two metrics by default
        if (availableMetrics.length > 1) {
          setSelectedMetrics([availableMetrics[0].id, availableMetrics[1].id])
        }
      } catch (error) {
        console.error("Failed to fetch metrics data:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch metrics data")
        
        // Generate mock data for development/demo purposes
        if (process.env.NODE_ENV === 'development') {
          const mockPriceData = generateMockPriceData()
          const mockMetricsData = generateMockMetricsData()
          
          setPriceData(mockPriceData)
          setMetricsData(mockMetricsData)
          
          // Auto-select first two metrics by default
          if (availableMetrics.length > 1) {
            setSelectedMetrics([availableMetrics[0].id, availableMetrics[1].id])
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  // Function to generate mock price data for development/demo purposes
  function generateMockPriceData() {
    const data = []
    const startDate = new Date()
    startDate.setFullYear(startDate.getFullYear() - 5)
    
    const basePrice = stockInfo.price || 100
    let currentPrice = basePrice * 0.7 // Start at 70% of current price 5 years ago
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i)
      
      // Add some randomness but with an overall upward trend
      const change = currentPrice * (Math.random() * 0.1 - 0.03)
      currentPrice += change
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(1, currentPrice),
      })
    }
    
    return data
  }

  // Function to generate mock metrics data for development/demo purposes
  function generateMockMetricsData() {
    const mockData: Record<string, MetricData[]> = {}
    
    availableMetrics.forEach(metric => {
      const data: MetricData[] = []
      const startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 5)
      
      // Set appropriate base values for each metric
      let baseValue: number
      switch (metric.id) {
        case 'pe':
          baseValue = 15
          break
        case 'eps':
          baseValue = stockInfo.eps || 5
          break
        case 'dividendYield':
          baseValue = 0.02 // 2%
          break
        case 'profitMargin':
          baseValue = 0.1 // 10%
          break
        case 'operatingMargin':
          baseValue = 0.15 // 15%
          break
        case 'returnOnEquity':
          baseValue = 0.12 // 12%
          break
        case 'returnOnAssets':
          baseValue = 0.08 // 8%
          break
        case 'priceToBook':
          baseValue = 2.5
          break
        case 'priceToSales':
          baseValue = 3.0
          break
        case 'evToEbitda':
          baseValue = 10
          break
        default:
          baseValue = 1
      }
      
      let currentValue = baseValue * 0.8 // Start at 80% of current value
      
      for (let i = 0; i < 20; i++) {
        const date = new Date(startDate)
        date.setMonth(date.getMonth() + i * 3) // Quarterly data
        
        // Add some randomness with a general trend toward current value
        const change = currentValue * (Math.random() * 0.2 - 0.05)
        currentValue += change
        
        if (i === 19) {
          // Make sure the last value is close to the actual current value
          currentValue = baseValue * (0.9 + Math.random() * 0.2)
        }
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0.01, currentValue),
        })
      }
      
      mockData[metric.id] = data
    })
    
    return mockData
  }

  function toggleMetric(metricId: string) {
    setSelectedMetrics(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    )
  }

  // Format value based on metric type
  function formatValue(value: number, metricId: string) {
    const metric = availableMetrics.find(m => m.id === metricId)
    if (!metric) return String(value)
    
    switch (metric.format) {
      case 'currency':
        return formatCurrency(value, stockInfo.currency)
      case 'percent':
        return formatPercent(value)
      case 'number':
      default:
        return formatNumber(value)
    }
  }

  // Combine price data with selected metrics for chart
  function getCombinedData() {
    if (!priceData.length) return []
    
    // Start with price data
    const combinedData = priceData.map(item => ({
      date: item.date,
      price: item.price,
    }))
    
    // Add selected metrics data
    selectedMetrics.forEach(metricId => {
      const metricData = metricsData[metricId] || []
      
      metricData.forEach(dataPoint => {
        // Find matching date in combined data
        const matchingPoint = combinedData.find(item => item.date === dataPoint.date)
        if (matchingPoint) {
          matchingPoint[metricId] = dataPoint.value
        } else {
          // If no matching date, find closest date
          const closestPoint = findClosestDatePoint(combinedData, new Date(dataPoint.date))
          if (closestPoint) {
            closestPoint[metricId] = dataPoint.value
          }
        }
      })
    })
    
    return combinedData
  }

  // Find the data point with the closest date
  function findClosestDatePoint(data: any[], targetDate: Date) {
    if (!data.length) return null
    
    return data.reduce((prev, curr) => {
      const prevDate = new Date(prev.date)
      const currDate = new Date(curr.date)
      const prevDiff = Math.abs(prevDate.getTime() - targetDate.getTime())
      const currDiff = Math.abs(currDate.getTime() - targetDate.getTime())
      
      return prevDiff < currDiff ? prev : curr
    })
  }

  // Get domain for secondary Y axis (metrics)
  function getMetricsDomain() {
    if (!selectedMetrics.length) return [0, 1]
    
    let min = Infinity
    let max = -Infinity
    
    selectedMetrics.forEach(metricId => {
      const data = metricsData[metricId] || []
      data.forEach(item => {
        min = Math.min(min, item.value)
        max = Math.max(max, item.value)
      })
    })
    
    // Add padding
    const padding = (max - min) * 0.1
    return [Math.max(0, min - padding), max + padding]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">Loading financial metrics...</div>
        </CardContent>
      </Card>
    )
  }

  const combinedData = getCombinedData()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Financial Metrics Evolution
            {error && <Badge variant="destructive">Error loading real data</Badge>}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={displayMode === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayMode("chart")}
            >
              Chart
            </Button>
            <Button
              variant={displayMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setDisplayMode("table")}
            >
              Table
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap gap-2">
            {availableMetrics.map(metric => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`metric-${metric.id}`}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => toggleMetric(metric.id)}
                />
                <label 
                  htmlFor={`metric-${metric.id}`}
                  className="flex items-center text-sm font-medium cursor-pointer"
                >
                  <div 
                    className="w-3 h-3 mr-1 rounded-full" 
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  {metric.name}
                </label>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="combine-price"
              checked={combinedWithPrice}
              onCheckedChange={(checked) => setCombinedWithPrice(!!checked)}
            />
            <label 
              htmlFor="combine-price"
              className="flex items-center text-sm font-medium cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
              Show with price chart
            </label>
          </div>
        </div>

        {displayMode === "chart" && (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {combinedWithPrice ? (
                <ComposedChart
                  data={combinedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="price" domain={['auto', 'auto']} />
                  <YAxis 
                    yAxisId="metrics" 
                    orientation="right" 
                    domain={getMetricsDomain()}
                  />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'price') return formatCurrency(Number(value), stockInfo.currency)
                    const metric = availableMetrics.find(m => m.id === name)
                    if (!metric) return [value, name]
                    return [formatValue(Number(value), name), metric.name]
                  }} />
                  <Legend />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="price" 
                    name="Price" 
                    stroke="#1f77b4" 
                    dot={false}
                    strokeWidth={2}
                  />
                  {selectedMetrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId)
                    if (!metric) return null
                    return (
                      <Line 
                        key={metricId}
                        yAxisId="metrics"
                        type="monotone" 
                        dataKey={metricId} 
                        name={metric.name}
                        stroke={metric.color}
                        dot={false}
                        strokeDasharray="5 5"
                      />
                    )
                  })}
                  <Brush dataKey="date" height={30} stroke="#8884d8" />
                </ComposedChart>
              ) : (
                <LineChart
                  data={selectedMetrics.flatMap(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId)
                    if (!metric) return []
                    return (metricsData[metricId] || []).map(item => ({
                      date: item.date,
                      [metricId]: item.value,
                      metricName: metric.name
                    }))
                  })}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={getMetricsDomain()} />
                  <Tooltip formatter={(value, name) => {
                    const metric = availableMetrics.find(m => m.id === name)
                    if (!metric) return [value, name]
                    return [formatValue(Number(value), name), metric.name]
                  }} />
                  <Legend />
                  {selectedMetrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId)
                    if (!metric) return null
                    return (
                      <Line 
                        key={metricId}
                        type="monotone" 
                        dataKey={metricId} 
                        name={metric.name}
                        stroke={metric.color}
                      />
                    )
                  })}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {displayMode === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  {combinedWithPrice && <th className="text-right p-2">Price</th>}
                  {selectedMetrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId)
                    return (
                      <th key={metricId} className="text-right p-2">{metric?.name || metricId}</th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {combinedData
                  .filter((_, i, arr) => i % Math.ceil(arr.length / 20) === 0) // Show only ~20 rows
                  .map((dataPoint, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{dataPoint.date}</td>
                      {combinedWithPrice && <td className="text-right p-2">{formatCurrency(dataPoint.price, stockInfo.currency)}</td>}
                      {selectedMetrics.map(metricId => {
                        const value = dataPoint[metricId]
                        return (
                          <td key={metricId} className="text-right p-2">
                            {value !== undefined ? formatValue(value, metricId) : '-'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

