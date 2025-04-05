import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import StockDetails from "@/components/stock-details"
import StockFinancials from "@/components/stock-financials"
import StockChartContainer from "@/components/stock-chart-container"
import StockMetricsComparison from "@/components/stock-metrics-comparison"
import { getStockOverview } from "@/lib/services/market-data"

export default async function StockPage({
  params,
}: {
  params: { symbol: string }
}) {
  const { symbol } = params

  try {
    // Fetch basic stock info to validate the symbol
    const stockInfo = await getStockOverview(symbol)

    if (!stockInfo) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/compare">
                <BarChart2 className="h-4 w-4 mr-2" />
                Compare Assets
              </Link>
            </Button>
          </div>

          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <StockDetails symbol={symbol} stockInfo={stockInfo} />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <StockChartContainer symbol={symbol} />
              </Suspense>

              <div className="mt-6">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <StockMetricsComparison symbol={symbol} stockInfo={stockInfo} />
                </Suspense>
              </div>
            </div>
            <div>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <StockFinancials symbol={symbol} stockInfo={stockInfo} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error(`Error loading stock ${symbol}:`, error)
    notFound()
  }
}

