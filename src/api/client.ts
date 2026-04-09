/**
 * ProductBoard API Client
 * Handles all HTTP requests to the ProductBoard API
 */

import { PRODUCTBOARD_API_BASE, USER_AGENT } from "../config.js";
import type { ProductBoardApiResponse } from "../types.js";

export class ProductBoardApiClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Fetch notes from ProductBoard API with optional query parameters
   */
  async fetchNotes(
    params: {
      term?: string;
      createdFrom?: string; // Date in YYYY-MM-DD format
      pageCursor?: string;
    } = {}
  ): Promise<ProductBoardApiResponse> {
    const urlParams = new URLSearchParams();
    
    if (params.term) {
      urlParams.append("term", params.term);
    }
    
    if (params.createdFrom) {
      urlParams.append("createdFrom", params.createdFrom);
    }
    
    if (params.pageCursor) {
      urlParams.append("pageCursor", params.pageCursor);
    }

    let url = `${PRODUCTBOARD_API_BASE}/notes`;
    const queryString = urlParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "User-Agent": USER_AGENT,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ProductBoard API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Extract page cursor from API response links
   */
  extractPageCursor(links: ProductBoardApiResponse["links"]): string | null {
    if (!links) return null;

    const nextLink = links.next;
    if (!nextLink) return null;

    try {
      if (typeof nextLink === "string") {
        const urlObj = new URL(nextLink);
        return urlObj.searchParams.get("pageCursor");
      } else if (typeof nextLink === "object" && nextLink.href) {
        const urlObj = new URL(nextLink.href);
        return urlObj.searchParams.get("pageCursor");
      }
    } catch (error) {
      // Invalid URL format
      return null;
    }

    return null;
  }
}

