"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X } from "lucide-react"
import { getAvailableCommodities } from "@/lib/api/commodity-api"
import { getAvailableTreasuries } from "@/lib/api/treasury-api"

interface AssetSelectorProps {
  onAddAsset: (asset: { symbol: string; type: string }) => void
  selectedAssets: Array<{ symbol: string; type: string }>
  onRemoveAsset: (symbol: string) => void
}

export default function AssetSelector({ onAddAsset, selectedAssets, onRemoveAsset }: AssetSelectorProps) {
  const [stockSymbol, setStockSymbol] = useState("")
  const [activeTab, setActiveTab] = useState("stocks")

  const commodities = getAvailableCommodities()
  const treasuries = getAvailableTreasuries()

  const handleAddStock = () => {
    if (stockSymbol.trim()) {
      onAddAsset({ symbol: stockSymbol.toUpperCase(), type: "stock" })
      setStockSymbol("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stocks" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
            <TabsTrigger value="treasuries">Treasuries</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
              />
              <Button onClick={handleAddStock}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="commodities">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {commodities.map((commodity) => (
                <Button
                  key={commodity.symbol}
                  variant="outline"
                  className="justify-start"
                  onClick={() => onAddAsset({ symbol: commodity.symbol, type: "commodity" })}
                >
                  {commodity.name}
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="treasuries">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {treasuries.map((treasury) => (
                <Button
                  key={treasury.symbol}
                  variant="outline"
                  className="justify-start"
                  onClick={() => onAddAsset({ symbol: treasury.symbol, type: "treasury" })}
                >
                  {treasury.name}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Selected Assets</h3>
          {selectedAssets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No assets selected. Add assets to compare them.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedAssets.map((asset) => (
                <div
                  key={`${asset.type}-${asset.symbol}`}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                >
                  <div>
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-xs ml-2 text-muted-foreground">{asset.type}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveAsset(asset.symbol)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

