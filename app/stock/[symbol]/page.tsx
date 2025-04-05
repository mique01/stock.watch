import { notFound } from "next/navigation"
import { getStockOverview } from "@/lib/services/market-data"
import StockChart from "@/components/stock-chart"
import StockDetails from "@/components/stock-details"
import StockMetricsComparison from "@/components/stock-metrics-comparison"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  params: {
    symbol: string
  }
}

export default async function StockPage(props: Props) {
  // Get the symbol from the URL parameters
  const symbol = props.params.symbol

  try {
    // Fetch stock data based on the symbol
    const stockInfo = await getStockOverview(symbol)

    // If no stock info is found, show not found page
    if (!stockInfo) {
      notFound()
    }

    return (
      <main className="container py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {stockInfo.name}
            <span className="text-lg font-normal text-muted-foreground">{symbol}</span>
          </h1>
        </div>

        <div className="grid gap-6">
          {/* Stock chart */}
          <StockChart symbol={symbol} stockInfo={stockInfo} />
          
          {/* Stock details */}
          <StockDetails symbol={symbol} stockInfo={stockInfo} />
          
          {/* Stock metrics comparison */}
          <StockMetricsComparison symbol={symbol} stockInfo={stockInfo} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("Error in stock page:", error)
    
    return (
      <main className="container py-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error al cargar los datos</AlertTitle>
          <AlertDescription>
            No pudimos cargar la información para el símbolo "{symbol}". Por favor, intente con otro símbolo o vuelva más tarde.
          </AlertDescription>
        </Alert>
      </main>
    )
  }
}

