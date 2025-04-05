"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate, normalizeData } from "@/lib/utils"
import type { AssetComparison } from "@/lib/types/market-data"

interface ComparisonChartProps {
  assets: AssetComparison[]
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
}

export default function ComparisonChart({ assets, timeframe, onTimeframeChange }: ComparisonChartProps) {
  const [normalizedMode, setNormalizedMode] = useState(true)
  const [visibleAssets, setVisibleAssets] = useState<Record<string, boolean>>({})
  const [normalizedData, setNormalizedData] = useState<AssetComparison[]>([])

  useEffect(() => {
    // Initialize visible assets
    const initialVisibility: Record<string, boolean> = {}
    assets.forEach((asset) => {
      initialVisibility[asset.symbol] = true
    })
    setVisibleAssets(initialVisibility)

    // Normalize data
    const normalized = normalizeData(assets)
    setNormalizedData(normalized)
  }, [assets])

  const toggleAssetVisibility = (symbol: string) => {
    setVisibleAssets((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }))
  }

  // Check if any assets have errors
  const assetsWithErrors = assets.filter((asset) => asset.error)

  // Prepare chart data
  const chartData = normalizedMode
    ? normalizedData.flatMap((asset) => (visibleAssets[asset.symbol] && asset.data.length > 0 ? asset.data : []))
    : assets.flatMap((asset) => (visibleAssets[asset.symbol] && asset.data.length > 0 ? asset.data : []))

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
                {entry.name}: {normalizedMode ? `${entry.value.toFixed(2)}%` : entry.value.toFixed(2)}
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
        <CardTitle>Asset Comparison</CardTitle>
        <div className="flex gap-1">
          {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="normalized"
              checked={normalizedMode}
              onCheckedChange={() => setNormalizedMode(!normalizedMode)}
            />
            <label
              htmlFor="normalized"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Normalize values (% change)
            </label>
          </div>
        </div>

        {assetsWithErrors.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Some assets couldn't be loaded: {assetsWithErrors.map((a) => a.symbol).join(", ")}
            </p>
          </div>
        )}

        <div className="h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => {
                    if (timeframe === "1D") {
                      return formatDate(tick, "time")
                    }
                    return formatDate(tick, "short")
                  }}
                />
                <YAxis
                  domain={normalizedMode ? ["dataMin", "dataMax"] : ["auto", "auto"]}
                  tickFormatter={(tick) => (normalizedMode ? `${tick.toFixed(2)}%` : tick.toFixed(2))}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {normalizedData.map(
                  (asset) =>
                    visibleAssets[asset.symbol] &&
                    asset.data.length > 0 && (
                      <Line
                        key={asset.symbol}
                        type="monotone"
                        dataKey={normalizedMode ? "normalizedValue" : "close"}
                        data={asset.data}
                        name={asset.name}
                        stroke={asset.color}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ),
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No data available for the selected assets and timeframe</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {assets.map((asset) => (
            <Button
              key={asset.symbol}
              variant={visibleAssets[asset.symbol] ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAssetVisibility(asset.symbol)}
              className={`flex items-center gap-2 ${asset.error ? "opacity-50" : ""}`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: normalizedData.find((a) => a.symbol === asset.symbol)?.color,
                }}
              />
              {asset.name}
              {asset.error && <span className="text-xs ml-1">(error)</span>}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

