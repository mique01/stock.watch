"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DataErrorFallbackProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function DataErrorFallback({ title = "Data Loading Error", message, onRetry }: DataErrorFallbackProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Possible solutions:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Check your API keys are correctly configured</li>
          <li>Verify the stock symbol is valid</li>
          <li>Try again later as the API provider might be experiencing issues</li>
          <li>Check if you've reached API rate limits</li>
        </ul>
      </div>
    </div>
  )
}

