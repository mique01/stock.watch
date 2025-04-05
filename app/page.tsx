import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MarketOverview from "@/components/market-overview"
import { getTopStocks } from "@/lib/services/market-data"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { TrendingDown, TrendingUp, Search, ChevronRight } from "lucide-react"
import StockSearch from "@/components/stock-search"

export const revalidate = 60 // revalidate this page every 60 seconds

export default async function Home() {
  const topStocks = await getTopStocks()

  return (
    <main className="container py-6">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Finanzas.watch</h1>
          <div className="w-[300px]">
            <StockSearch />
          </div>
        </div>
        
        <p className="text-xl text-muted-foreground">
          Monitoree el mercado en tiempo real y analice ratios financieros de empresas
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-8">
        <Suspense fallback={<p>Cargando datos de mercado...</p>}>
          <MarketOverview />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Acciones Destacadas</CardTitle>
              <CardDescription>
                Las acciones más relevantes del mercado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Símbolo</th>
                      <th className="text-left p-3 font-medium">Empresa</th>
                      <th className="text-right p-3 font-medium">Precio</th>
                      <th className="text-right p-3 font-medium">Cambio</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStocks.map((stock) => (
                      <tr key={stock.symbol} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-medium">
                          {stock.symbol}
                        </td>
                        <td className="p-3">
                          {stock.name}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(stock.price, stock.currency)}
                        </td>
                        <td className="p-3 text-right">
                          <div className={`flex items-center justify-end ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            <span>
                              {formatPercentage(stock.changePercent)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/stock/${stock.symbol}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buscar Acciones</CardTitle>
              <CardDescription>
                Analice cualquier empresa pública
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Busque por símbolo o nombre de la empresa para ver información detallada, ratios financieros y gráficos de precios.
              </p>
              <div className="w-full">
                <StockSearch />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Explorar por sector</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    Tecnología
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Finanzas
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Salud
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Consumo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparar Empresas</CardTitle>
            <CardDescription>
              Compare ratios financieros y rendimientos entre múltiples empresas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <p className="text-sm text-muted-foreground flex-1">
                Seleccione dos o más empresas para comparar sus ratios financieros, rendimientos históricos y valoraciones.
              </p>
              <Button asChild>
                <Link href="/compare">
                  <Search className="h-4 w-4 mr-2" />
                  Comparar Empresas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

