"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { fetchStockQuote } from "@/lib/alpha-vantage-client"

type WatchlistItem = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}

export default function WatchlistSection() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem("stockWatchlist")
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist)
        setWatchlist(parsed)
        // Refresh data for saved watchlist
        refreshWatchlistData(parsed)
      } catch (e) {
        console.error("Failed to parse watchlist", e)
      }
    }
  }, [])

  const refreshWatchlistData = async (items: WatchlistItem[]) => {
    setIsLoading(true)
    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const quote = await fetchStockQuote(item.symbol)
            return {
              ...item,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
            }
          } catch (e) {
            console.error(`Failed to fetch data for ${item.symbol}`, e)
            return item
          }
        }),
      )
      setWatchlist(updatedItems)
      localStorage.setItem("stockWatchlist", JSON.stringify(updatedItems))
    } catch (e) {
      console.error("Failed to refresh watchlist data", e)
    } finally {
      setIsLoading(false)
    }
  }

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return

    setIsLoading(true)
    try {
      const quote = await fetchStockQuote(newSymbol)
      const newItem = {
        symbol: newSymbol.toUpperCase(),
        name: quote.name || newSymbol.toUpperCase(),
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        currency: quote.currency || "USD",
      }

      const updatedWatchlist = [...watchlist, newItem]
      setWatchlist(updatedWatchlist)
      localStorage.setItem("stockWatchlist", JSON.stringify(updatedWatchlist))
      setNewSymbol("")
    } catch (e) {
      console.error("Failed to add to watchlist", e)
      alert(`Failed to add ${newSymbol}. Please check the symbol and try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    const updatedWatchlist = watchlist.filter((item) => item.symbol !== symbol)
    setWatchlist(updatedWatchlist)
    localStorage.setItem("stockWatchlist", JSON.stringify(updatedWatchlist))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add symbol (e.g., AAPL)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          />
          <Button onClick={addToWatchlist} disabled={isLoading || !newSymbol.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Your watchlist is empty. Add stocks to track them here.
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((item) => (
              <div key={item.symbol} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div>
                  <div className="font-medium">{item.symbol}</div>
                  <div className="text-sm text-muted-foreground">{item.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-right font-medium">{formatCurrency(item.price, item.currency)}</div>
                    <div
                      className={`text-sm flex items-center justify-end ${
                        item.change >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {item.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {formatPercentage(item.changePercent)}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromWatchlist(item.symbol)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {watchlist.length > 0 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => refreshWatchlistData(watchlist)}
            disabled={isLoading}
          >
            Refresh Data
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

