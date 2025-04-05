"use client"

import { useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

type StockChartProps = {
  data: any[]
  symbol: string
}

export default function StockChart({ data, symbol }: StockChartProps) {
  const [timeframe, setTimeframe] = useState("1D")

  // Calculate if the stock is up or down
  const firstPrice = data[0]?.price || 0
  const lastPrice = data[data.length - 1]?.price || 0
  const isPositive = lastPrice >= firstPrice

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <CardContent className="p-2">
            <p className="text-sm">{new Date(label).toLocaleString()}</p>
            <p className="font-bold">{formatCurrency(payload[0].value, "USD")}</p>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold">{symbol}</h3>
          <p className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(lastPrice, "USD")} ({(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%)
          </p>
        </div>
        <div className="flex gap-1">
          {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
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
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.8} />
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => {
                const date = new Date(tick)
                if (timeframe === "1D") {
                  return date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
                return date.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis domain={["dataMin", "dataMax"]} tickFormatter={(tick) => formatCurrency(tick, "USD")} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

