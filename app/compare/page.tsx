"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AssetSelector from "@/components/asset-selector"
import ComparisonChart from "@/components/comparison-chart"
import { getAssetComparisonData } from "@/lib/services/market-data"
import type { AssetComparison } from "@/lib/types/market-data"
import { getRandomColor } from "@/lib/utils"

export default function ComparePage() {
  const [selectedAssets, setSelectedAssets] = useState<Array<{ symbol: string; type: string }>>([])
  const [comparisonData, setComparisonData] = useState<AssetComparison[]>([])
  const [timeframe, setTimeframe] = useState("1M")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedAssets.length > 0) {
      fetchComparisonData()
    } else {
      setComparisonData([])
    }
  }, [selectedAssets, timeframe])

  const fetchComparisonData = async () => {
    setIsLoading(true)
    try {
      const data = await getAssetComparisonData(selectedAssets, timeframe)

      // Assign colors to each asset
      const dataWithColors = data.map((asset) => ({
        ...asset,
        color: getRandomColor(),
      }))

      setComparisonData(dataWithColors)
    } catch (error) {
      console.error("Error fetching comparison data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAsset = (asset: { symbol: string; type: string }) => {
    // Check if asset is already selected
    if (selectedAssets.some((a) => a.symbol === asset.symbol && a.type === asset.type)) {
      return
    }

    setSelectedAssets((prev) => [...prev, asset])
  }

  const handleRemoveAsset = (symbol: string) => {
    setSelectedAssets((prev) => prev.filter((asset) => asset.symbol !== symbol))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">Compare Assets</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <AssetSelector
              onAddAsset={handleAddAsset}
              selectedAssets={selectedAssets}
              onRemoveAsset={handleRemoveAsset}
            />
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[500px] w-full" />
            ) : comparisonData.length > 0 ? (
              <ComparisonChart assets={comparisonData} timeframe={timeframe} onTimeframeChange={setTimeframe} />
            ) : (
              <div className="h-[500px] flex items-center justify-center bg-card rounded-lg">
                <div className="text-center p-6">
                  <h3 className="text-xl font-semibold mb-2">No Assets Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select assets from the panel on the left to compare them.
                  </p>
                  <Button asChild>
                    <Link href="/">Browse Stocks</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

