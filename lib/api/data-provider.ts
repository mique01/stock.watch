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

// Function to check if an error is related to API key configuration
function isApiKeyError(error: any): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage.includes("API key") || 
         errorMessage.includes("key is not configured") ||
         errorMessage.includes("apikey");
}

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

  // If no provider is specified, throw an error
  if (!config.primaryProvider) {
    throw new Error(`No data provider specified for ${endpoint}`);
  }

  // Try primary provider
  try {
    let data: T

    if (config.primaryProvider === "alpha-vantage") {
      data = await alphaVantage.fetchEndpoint(endpoint, params)
    } else if (config.primaryProvider === "finnhub") {
      data = await finnhub.fetchEndpoint(endpoint, params)
    } else {
      throw new Error(`Unknown provider: ${config.primaryProvider}`)
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

    // If the error is related to API key, don't try fallback as it will likely have the same issue
    if (isApiKeyError(error)) {
      // Use demo/mock data for development and testing
      if (process.env.NODE_ENV === "development") {
        return generateMockData(endpoint, params) as T;
      }
      throw error;
    }

    // Try fallback provider if available
    if (config.fallbackProvider) {
      try {
        let data: T

        if (config.fallbackProvider === "alpha-vantage") {
          data = await alphaVantage.fetchEndpoint(endpoint, params)
        } else if (config.fallbackProvider === "finnhub") {
          data = await finnhub.fetchEndpoint(endpoint, params)
        } else {
          throw new Error(`Unknown fallback provider: ${config.fallbackProvider}`)
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
        
        // Use mock data in development environment
        if (process.env.NODE_ENV === "development") {
          return generateMockData(endpoint, params) as T;
        }
        
        throw new Error(`Failed to fetch data from all providers for ${endpoint}`)
      }
    }

    // Use mock data in development environment if no fallback
    if (process.env.NODE_ENV === "development") {
      return generateMockData(endpoint, params) as T;
    }

    throw error
  }
}

// Generate mock data for development and testing
function generateMockData(endpoint: string, params: Record<string, any>): any {
  const symbol = params.symbol || 'AAPL';
  
  switch (endpoint) {
    case 'quote':
      return {
        symbol,
        price: 150 + Math.random() * 10,
        change: Math.random() * 5 - 2.5,
        changePercent: (Math.random() * 0.05 - 0.025),
        volume: Math.floor(Math.random() * 1000000),
        currency: "USD",
        isMockData: true
      };
    
    case 'overview':
      return {
        symbol,
        name: `${symbol} Inc.`,
        description: `This is a mock description for ${symbol}`,
        exchange: "NASDAQ",
        currency: "USD",
        country: "US",
        sector: "Technology",
        industry: "Software",
        marketCap: 2000000000000,
        pe: 25 + Math.random() * 10,
        eps: 5 + Math.random() * 2,
        beta: 1 + Math.random() * 0.5,
        high52Week: 180 + Math.random() * 20,
        low52Week: 140 - Math.random() * 20,
        dividendYield: 0.01 + Math.random() * 0.01,
        dividendPerShare: 0.5 + Math.random() * 0.5,
        evToEbitda: 15 + Math.random() * 5,
        profitMargin: 0.2 + Math.random() * 0.1,
        operatingMargin: 0.25 + Math.random() * 0.1,
        returnOnAssets: 0.1 + Math.random() * 0.05,
        returnOnEquity: 0.15 + Math.random() * 0.1,
        revenuePerShare: 20 + Math.random() * 10,
        priceToBook: 5 + Math.random() * 2,
        priceToSales: 4 + Math.random() * 2,
        website: "https://example.com",
        isMockData: true
      };
      
    case 'TIME_SERIES_DAILY':
    case 'TIME_SERIES_WEEKLY':
    case 'TIME_SERIES_MONTHLY':
    case 'TIME_SERIES_INTRADAY':
      // Generate time series data
      const dataPoints = 30;
      const result = [];
      const basePrice = 150;
      const startDate = new Date();
      
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - i);
        
        const change = basePrice * (Math.random() * 0.04 - 0.02);
        const price = basePrice + change * i;
        
        result.push({
          date: date.toISOString().split('T')[0],
          open: price - Math.random() * 2,
          high: price + Math.random() * 2,
          low: price - Math.random() * 2,
          close: price,
          volume: Math.floor(Math.random() * 1000000),
        });
      }
      
      return result;
      
    default:
      return { isMockData: true, message: "No mock data template for this endpoint" };
  }
}

// Clear cache for testing or when needed
export function clearCache() {
  Object.keys(cache).forEach((key) => delete cache[key])
}

