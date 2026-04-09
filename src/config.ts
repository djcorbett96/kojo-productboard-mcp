/**
 * Configuration constants and environment variables
 */

export const PRODUCTBOARD_API_BASE = "https://api.productboard.com";
export const USER_AGENT = "productboard-app/1.0";
export const MAX_PAGES_TO_FETCH = 100; // Safety limit to prevent excessive API calls
export const DEFAULT_LIMIT = 100;
export const MAX_LIMIT = 1000;

/**
 * Get the ProductBoard API token from environment variables
 * @throws Error if token is not set
 */
export function getApiToken(): string {
  const token = process.env.PRODUCTBOARD_API_TOKEN;
  if (!token) {
    throw new Error(
      "PRODUCTBOARD_API_TOKEN environment variable is required"
    );
  }
  return token;
}









