// Central data provider that manages multiple API sources
import * as alphaVantage from "./alpha-vantage-api"
import * as finnhub from "./finnhub-api"
import { logError } from "../utils"

// API provider types
export type DataProvider = "alpha-vantage" | "finnhub"

// Configuration for data fetching
export interface FetchConfig {
  primaryProvider?: DataProvider
  fallbackProvider?: DataProvider
  cacheDuration?: number // in seconds
}

// Default configuration
const defaultConfig: FetchConfig = {
  primaryProvider: "alpha-vantage",
  fallbackProvider: "finnhub",
  cacheDuration: 60, // 1 minute cache for real-time data
}

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}

// Update the fetchData function to better handle non-JSON responses

// Generic fetch function with provider fallback
export async function fetchData<T>(
  endpoint: string,
  params: Record<string, any>,
  config: FetchConfig = defaultConfig,
): Promise<T> {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`

  // Check cache if available
  if (cache[cacheKey] && config.cacheDuration) {
    const now = Date.now()
    const cacheAge = (now - cache[cacheKey].timestamp) / 1000

    if (cacheAge < config.cacheDuration) {
      return cache[cacheKey].data as T
    }
  }

  // Try primary provider
  try {
    let data: T

    if (config.primaryProvider === "alpha-vantage") {
      data = await alphaVantage.fetchEndpoint(endpoint, params)
    } else {
      data = await finnhub.fetchEndpoint(endpoint, params)
    }

    // Cache the result
    if (config.cacheDuration) {
      cache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }
    }

    return data
  } catch (error) {
    logError(`Error with primary provider (${config.primaryProvider}):`, error)

    // Try fallback provider if available
    if (config.fallbackProvider) {
      try {
        let data: T

        if (config.fallbackProvider === "alpha-vantage") {
          data = await alphaVantage.fetchEndpoint(endpoint, params)
        } else {
          data = await finnhub.fetchEndpoint(endpoint, params)
        }

        // Cache the result
        if (config.cacheDuration) {
          cache[cacheKey] = {
            data,
            timestamp: Date.now(),
          }
        }

        return data
      } catch (fallbackError) {
        logError(`Error with fallback provider (${config.fallbackProvider}):`, fallbackError)
        throw new Error(`Failed to fetch data from all providers for ${endpoint}`)
      }
    }

    throw error
  }
}

// Clear cache for testing or when needed
export function clearCache() {
  Object.keys(cache).forEach((key) => delete cache[key])
}

