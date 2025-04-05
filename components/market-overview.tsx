import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMarketIndices } from "@/lib/alpha-vantage"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"

export default async function MarketOverview() {
  const indices = await fetchMarketIndices()

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.map((index) => (
          <Card key={index.symbol}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{index.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatCurrency(index.price, index.currency)}</span>
                <div className={`flex items-center ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {index.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                  <span className="font-medium">
                    {formatCurrency(Math.abs(index.change), index.currency)} ({formatPercentage(index.changePercent)})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

