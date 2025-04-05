"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function StockSearch() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/stock/${query.trim()}`)
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Search Stocks</h2>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  )
}

