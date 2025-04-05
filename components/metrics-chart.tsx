"use client"

import { useState } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatCurrency, formatPercentage } from "@/lib/utils"
import type { TimeSeriesData, MetricTimeSeries } from "@/lib/types/market-data"

interface MetricsChartProps {
  symbol: string
  priceData: TimeSeriesData[]
  metricsData: MetricTimeSeries[]
}

export default function MetricsChart({ symbol, priceData, metricsData }: MetricsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>(metricsData.length > 0 ? metricsData[0].metric : "")

  // Prepare combined data
  const combinedData = priceData.map((pricePoint) => {
    const date = pricePoint.date
    const result: any = { date, price: pricePoint.close }

    metricsData.forEach((metric) => {
      const metricPoint = metric.data.find((m) => m.date === date)
      if (metricPoint) {
        result[metric.metric] = metricPoint.value
      }
    })

    return result
  })

  // Format value based on metric type
  const formatMetricValue = (value: number, metric: string) => {
    if (metric.includes("Margin") || metric.includes("ROE") || metric.includes("ROA")) {
      return formatPercentage(value)
    } else if (metric.includes("EPS") || metric.includes("Revenue")) {
      return formatCurrency(value)
    } else {
      return value.toFixed(2)
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="text-sm font-medium">{formatDate(label, "long")}</p>
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center mt-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              <span className="text-sm">
                {entry.name}:{" "}
                {entry.dataKey === "price" ? formatCurrency(entry.value) : formatMetricValue(entry.value, entry.name)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Price vs. Financial Metrics</CardTitle>
        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metricsData.map((metric) => (
              <SelectItem key={metric.metric} value={metric.metric}>
                {metric.metric}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tickFormatter={(tick) => formatDate(tick, "short")} />
              <YAxis yAxisId="left" orientation="left" tickFormatter={(tick) => formatCurrency(tick)} />
              <YAxis yAxisId="right" orientation="right" domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Line yAxisId="left" type="monotone" dataKey="price" name="Price" stroke="#10b981" dot={false} />

              {selectedMetric && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={selectedMetric}
                  name={selectedMetric}
                  stroke="#8b5cf6"
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

