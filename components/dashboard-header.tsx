import { ModeToggle } from "./mode-toggle"
import { Bell, Settings, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardHeader() {
  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Stock Dashboard</h1>
        <p className="text-muted-foreground">Real-time and historical stock data visualization</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/compare">
            <BarChart2 className="h-4 w-4 mr-2" />
            Compare
          </Link>
        </Button>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}

