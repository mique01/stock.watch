import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils"

type StockFinancialsProps = {
  symbol: string
  stockInfo: any
}

export default function StockFinancials({ symbol, stockInfo }: StockFinancialsProps) {
  const metrics = [
    { name: "P/E Ratio", value: stockInfo.pe, format: "number" },
    { name: "EPS", value: stockInfo.eps, format: "currency" },
    { name: "Dividend Yield", value: stockInfo.dividendYield, format: "percentage" },
    { name: "Dividend Per Share", value: stockInfo.dividendPerShare, format: "currency" },
    { name: "EV/EBITDA", value: stockInfo.evToEbitda, format: "number" },
    { name: "Profit Margin", value: stockInfo.profitMargin, format: "percentage" },
    { name: "Operating Margin", value: stockInfo.operatingMargin, format: "percentage" },
    { name: "Return on Assets", value: stockInfo.returnOnAssets, format: "percentage" },
    { name: "Return on Equity", value: stockInfo.returnOnEquity, format: "percentage" },
    { name: "Revenue Per Share", value: stockInfo.revenuePerShare, format: "currency" },
    { name: "Price to Book", value: stockInfo.priceToBook, format: "number" },
    { name: "Price to Sales", value: stockInfo.priceToSales, format: "number" },
  ]

  const formatValue = (value: number, format: string) => {
    if (value === undefined || value === null) return "N/A"

    switch (format) {
      case "currency":
        return formatCurrency(value, "USD")
      case "percentage":
        return formatPercentage(value)
      case "number":
        return formatNumber(value)
      default:
        return value.toString()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div key={metric.name} className="flex justify-between">
              <span className="text-sm text-muted-foreground">{metric.name}</span>
              <span className="font-medium">{formatValue(metric.value, metric.format)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

