"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StockOverview } from "@/lib/types/market-data"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, TrendingUp, BarChart2, Globe, Info } from "lucide-react"

type StockDetailsProps = {
  symbol: string
  stockInfo: StockOverview
}

export default function StockDetails({ symbol, stockInfo }: StockDetailsProps) {
  const isPriceUp = stockInfo.changePercent > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {stockInfo.name}
              <Badge className="border">{symbol}</Badge>
              {stockInfo.isMockData && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">DEMO DATA</Badge>}
            </CardTitle>
            <CardDescription>
              {stockInfo.exchange && `${stockInfo.exchange} • `} 
              {stockInfo.sector && `${stockInfo.sector}`} 
              {stockInfo.country && ` • ${stockInfo.country}`}
              {stockInfo.website && (
                <a 
                  href={stockInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ml-2 inline-flex items-center text-primary hover:underline"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatCurrency(stockInfo.price, stockInfo.currency)}</div>
            <div className={`flex items-center justify-end ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              <span>{formatCurrency(stockInfo.change, stockInfo.currency)}</span>
              <span className="ml-1">({formatPercent(stockInfo.changePercent)})</span>
              <TrendingUp className={`h-4 w-4 ml-1 ${isPriceUp ? '' : 'transform rotate-180'}`} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="mt-2">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="market-data" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-1" />
              Market Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-2">
            <div className="text-sm text-muted-foreground mb-4 max-h-32 overflow-y-auto">
              {stockInfo.description || "No description available for this company."}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-medium">{stockInfo.marketCap ? formatNumber(stockInfo.marketCap) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">P/E Ratio</div>
                <div className="font-medium">{stockInfo.pe ? formatNumber(stockInfo.pe) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EPS</div>
                <div className="font-medium">{stockInfo.eps ? formatCurrency(stockInfo.eps, stockInfo.currency) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">52W High</div>
                <div className="font-medium">{stockInfo.high52Week ? formatCurrency(stockInfo.high52Week, stockInfo.currency) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">52W Low</div>
                <div className="font-medium">{stockInfo.low52Week ? formatCurrency(stockInfo.low52Week, stockInfo.currency) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Beta</div>
                <div className="font-medium">{stockInfo.beta ? formatNumber(stockInfo.beta) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Dividend Yield</div>
                <div className="font-medium">{stockInfo.dividendYield ? formatPercent(stockInfo.dividendYield) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Profit Margin</div>
                <div className="font-medium">{stockInfo.profitMargin ? formatPercent(stockInfo.profitMargin) : "N/A"}</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="market-data" className="mt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="font-medium">{stockInfo.volume ? formatNumber(stockInfo.volume) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Prev. Close</div>
                <div className="font-medium">{stockInfo.previousClose ? formatCurrency(stockInfo.previousClose, stockInfo.currency) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">EV/EBITDA</div>
                <div className="font-medium">{stockInfo.evToEbitda ? formatNumber(stockInfo.evToEbitda) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">P/B Ratio</div>
                <div className="font-medium">{stockInfo.priceToBook ? formatNumber(stockInfo.priceToBook) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">P/S Ratio</div>
                <div className="font-medium">{stockInfo.priceToSales ? formatNumber(stockInfo.priceToSales) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">ROE</div>
                <div className="font-medium">{stockInfo.returnOnEquity ? formatPercent(stockInfo.returnOnEquity) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">ROA</div>
                <div className="font-medium">{stockInfo.returnOnAssets ? formatPercent(stockInfo.returnOnAssets) : "N/A"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Revenue/Share</div>
                <div className="font-medium">{stockInfo.revenuePerShare ? formatCurrency(stockInfo.revenuePerShare, stockInfo.currency) : "N/A"}</div>
              </div>
              {stockInfo.latestTradingDay && (
                <div>
                  <div className="text-sm text-muted-foreground">Latest Trading</div>
                  <div className="font-medium">{stockInfo.latestTradingDay}</div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

