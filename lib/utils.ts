import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = "USD"): string {
  if (value === undefined || value === null) return "N/A"

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(value)
}

export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return "N/A"

  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(value / 100)
}

// Add format percent function for direct percentage formatting without dividing by 100
export function formatPercent(value: number): string {
  if (value === undefined || value === null) return "N/A"

  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(value)
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null) return "N/A"

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + "B"
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + "M"
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + "K"
  } else {
    return value.toFixed(2)
  }
}

export function formatDate(date: string | Date, format = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date

  if (format === "short") {
    return d.toLocaleDateString()
  } else if (format === "long") {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } else if (format === "time") {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (format === "datetime") {
    return d.toLocaleString()
  }

  return d.toLocaleDateString()
}

export function getRandomColor(): string {
  const colors = [
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#f97316", // orange
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}

export function normalizeData(
  datasets: Array<{ symbol: string; data: any[]; color?: string }>,
): Array<{ symbol: string; data: any[]; color: string }> {
  // Assign colors if not provided
  const datasetsWithColors = datasets.map((dataset) => ({
    ...dataset,
    color: dataset.color || getRandomColor(),
  }))

  // Find the earliest and latest dates across all datasets
  let earliestDate = new Date()
  let latestDate = new Date(0)

  datasetsWithColors.forEach((dataset) => {
    dataset.data.forEach((point) => {
      const date = new Date(point.date)
      if (date < earliestDate) earliestDate = date
      if (date > latestDate) latestDate = date
    })
  })

  // Normalize the data to percentage change from the first point
  return datasetsWithColors.map((dataset) => {
    if (dataset.data.length === 0) return dataset

    const firstValue = dataset.data[0].close

    const normalizedData = dataset.data.map((point) => ({
      ...point,
      normalizedValue: (point.close / firstValue - 1) * 100,
      originalValue: point.close,
    }))

    return {
      ...dataset,
      data: normalizedData,
    }
  })
}

export function logError(message: string, error: any): void {
  console.error(message)

  if (error instanceof Error) {
    console.error(`Error name: ${error.name}`)
    console.error(`Error message: ${error.message}`)
    console.error(`Error stack: ${error.stack}`)
  } else {
    console.error("Unknown error type:", error)
  }
}

