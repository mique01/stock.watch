"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMetricTimeSeries } from "@/lib/services/market-data"
import { getTimeSeries } from "@/lib/services/market-data"
import type { MetricTimeSeries, TimeSeriesData } from "@/lib/types/market-data"
import MetricsChart from "./metrics-chart"

interface StockMetricsComparisonProps {
  symbol: string
  stockInfo: any
}

export default function StockMetricsComparison({ symbol, stockInfo }: StockMetricsComparisonProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["pe"])
  const [metricsData, setMetricsData] = useState<MetricTimeSeries[]>([])
  const [priceData, setPriceData] = useState<TimeSeriesData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const availableMetrics = [
    { value: "pe", label: "P/E Ratio" },
    { value: "eps", label: "EPS" },
    { value: "evToEbitda", label: "EV/EBITDA" },
    { value: "profitMargin", label: "Profit Margin" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch historical price data
        const priceHistory = await getTimeSeries(symbol, "1Y")
        setPriceData(priceHistory)

        // Fetch historical metrics data
        const metricsHistory = await getMetricTimeSeries(symbol, selectedMetrics)
        setMetricsData(metricsHistory)
      } catch (error) {
        console.error("Error fetching metrics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol, selectedMetrics])

  const handleMetricChange = (value: string) => {
    setSelectedMetrics([value])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Metrics vs. Price</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">Loading metrics data...</div>
        ) : (
          <MetricsChart symbol={symbol} priceData={priceData} metricsData={metricsData} />
        )}
      </CardContent>
    </Card>
  )
}

