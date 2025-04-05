/**
 * Safely parses a response to JSON, handling non-JSON responses gracefully
 */
export async function safeParseJSON(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type")

  if (!contentType || !contentType.includes("application/json")) {
    // If not JSON, get the text and throw an error with details
    const text = await response.text()
    throw new Error(
      `Expected JSON but got ${contentType || "unknown content type"}\n` +
        `Status: ${response.status} ${response.statusText}\n` +
        `Response body (first 500 chars): ${text.substring(0, 500)}`,
    )
  }

  try {
    return await response.json()
  } catch (error) {
    // If JSON parsing fails, get the text and throw an error with details
    const text = await response.text()
    throw new Error(
      `Failed to parse JSON response: ${error instanceof Error ? error.message : "Unknown error"}\n` +
        `Response body (first 500 chars): ${text.substring(0, 500)}`,
    )
  }
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      retries++
      if (retries > maxRetries) {
        throw error
      }

      console.warn(
        `Retry ${retries}/${maxRetries} after error: ${error instanceof Error ? error.message : "Unknown error"}`,
      )

      // Wait for the delay period
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Exponential backoff
      delay *= 2
    }
  }
}

