import { Suspense } from "react"
import DashboardHeader from "./dashboard-header"
import MarketOverview from "./market-overview"
import StockSearch from "./stock-search"
import WatchlistSection from "./watchlist-section"
import RecentStocks from "./recent-stocks"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <StockSearch />
          <Suspense fallback={<Skeleton className="h-[300px] w-full mt-6" />}>
            <MarketOverview />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[400px] w-full mt-6" />}>
            <RecentStocks />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <WatchlistSection />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

