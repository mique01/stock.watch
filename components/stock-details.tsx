import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"
import { fetchStockQuote } from "@/lib/alpha-vantage"
import { ArrowDown, ArrowUp, Globe, TrendingUp } from "lucide-react"

type StockDetailsProps = {
  symbol: string
  stockInfo: any
}

export default async function StockDetails({ symbol, stockInfo }: StockDetailsProps) {
  const quote = await fetchStockQuote(symbol)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{symbol}</CardTitle>
              <Badge variant="outline">{stockInfo.exchange}</Badge>
            </div>
            <p className="text-lg font-medium">{stockInfo.name}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(quote.price, quote.currency)}</div>
            <div
              className={`flex items-center justify-end text-lg ${
                quote.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {quote.change >= 0 ? <ArrowUp className="h-5 w-5 mr-1" /> : <ArrowDown className="h-5 w-5 mr-1" />}
              {formatCurrency(Math.abs(quote.change), quote.currency)} ({formatPercentage(quote.changePercent)})
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-medium">{formatCurrency(stockInfo.marketCap, quote.currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="font-medium">{formatNumber(quote.volume)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">52W High</p>
            <p className="font-medium">{formatCurrency(stockInfo.high52Week, quote.currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">52W Low</p>
            <p className="font-medium">{formatCurrency(stockInfo.low52Week, quote.currency)}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">About {stockInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{stockInfo.description}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
              <a href={stockInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                {stockInfo.website}
              </a>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Sector: {stockInfo.sector}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

