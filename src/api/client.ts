/**
 * ProductBoard API Client
 * Handles all HTTP requests to the ProductBoard API
 */

import { PRODUCTBOARD_API_BASE, USER_AGENT } from "../config.js";
import type {
  ProductBoardApiResponse,
  ProductBoardFeature,
  ProductBoardFeaturesApiResponse,
} from "../types.js";

export class ProductBoardApiClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private baseHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
    };
  }

  /**
   * Generic GET request to the ProductBoard API
   */
  async get(
    path: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<Response> {
    const urlParams = new URLSearchParams(params);
    let url = `${PRODUCTBOARD_API_BASE}${path}`;
    const queryString = urlParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return fetch(url, {
      headers: { ...this.baseHeaders(), ...headers },
    });
  }

  /**
   * Generic POST request to the ProductBoard API
   */
  async post(
    path: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<Response> {
    return fetch(`${PRODUCTBOARD_API_BASE}${path}`, {
      method: "POST",
      headers: { ...this.baseHeaders(), ...headers },
      body: JSON.stringify(body),
    });
  }

  /**
   * Generic PATCH request to the ProductBoard API
   */
  async patch(
    path: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<Response> {
    return fetch(`${PRODUCTBOARD_API_BASE}${path}`, {
      method: "PATCH",
      headers: { ...this.baseHeaders(), ...headers },
      body: JSON.stringify(body),
    });
  }

  // ──────────────────────────────────────────────
  // Notes API (no X-Version header needed)
  // ──────────────────────────────────────────────

  /**
   * Fetch notes with optional query parameters
   */
  async fetchNotes(
    params: {
      term?: string;
      createdFrom?: string;
      state?: string;
      pageCursor?: string;
    } = {}
  ): Promise<ProductBoardApiResponse> {
    const queryParams: Record<string, string> = {};
    if (params.term) queryParams.term = params.term;
    if (params.createdFrom) queryParams.createdFrom = params.createdFrom;
    if (params.state) queryParams.state = params.state;
    if (params.pageCursor) queryParams.pageCursor = params.pageCursor;

    const response = await this.get("/notes", queryParams);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ProductBoard API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Link a note to one or more features via PATCH
   */
  async linkNoteToFeature(
    noteId: string,
    featureId: string
  ): Promise<{ success: boolean; noteId: string; featureId: string }> {
    const response = await this.patch(`/notes/${noteId}`, {
      data: {
        features: [{ id: featureId }],
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to link note ${noteId} to feature ${featureId}: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return { success: true, noteId, featureId };
  }

  // ──────────────────────────────────────────────
  // Features API (requires X-Version: 1 header)
  // ──────────────────────────────────────────────

  private static readonly VERSION_HEADER = { "X-Version": "1" };

  /**
   * Fetch a page of features
   */
  async fetchFeatures(
    pageCursor?: string
  ): Promise<ProductBoardFeaturesApiResponse> {
    const params: Record<string, string> = {};
    if (pageCursor) params.pageCursor = pageCursor;

    const response = await this.get(
      "/features",
      params,
      ProductBoardApiClient.VERSION_HEADER
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ProductBoard API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Fetch a single feature by ID
   */
  async getFeature(featureId: string): Promise<ProductBoardFeature> {
    const response = await this.get(
      `/features/${featureId}`,
      undefined,
      ProductBoardApiClient.VERSION_HEADER
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get feature ${featureId}: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const body = await response.json();
    return body.data;
  }

  /**
   * Create a new feature
   */
  async createFeature(params: {
    name: string;
    description?: string;
    parentComponentId: string;
    statusId: string;
  }): Promise<ProductBoardFeature> {
    const response = await this.post(
      "/features",
      {
        data: {
          name: params.name,
          description: params.description || "",
          type: "feature",
          parent: {
            component: { id: params.parentComponentId },
          },
          status: { id: params.statusId },
        },
      },
      ProductBoardApiClient.VERSION_HEADER
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create feature: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const body = await response.json();
    return body.data;
  }

  /**
   * Fetch all features with pagination, applying client-side search.
   * The Productboard API does not support server-side feature search.
   */
  async searchFeatures(
    query: string,
    limit: number = 25
  ): Promise<ProductBoardFeature[]> {
    const queryLower = query.toLowerCase();
    const matches: ProductBoardFeature[] = [];
    let pageCursor: string | undefined;
    let pagesFetched = 0;

    while (pagesFetched < 100) {
      const response = await this.fetchFeatures(pageCursor);
      const features = response.data || [];

      for (const feature of features) {
        if (feature.archived) continue;

        const nameMatch = feature.name?.toLowerCase().includes(queryLower);
        const descMatch = feature.description
          ?.toLowerCase()
          .replace(/<[^>]*>/g, "") // Strip HTML tags
          .includes(queryLower);

        if (nameMatch || descMatch) {
          matches.push(feature);
          if (matches.length >= limit) return matches;
        }
      }

      // Check for next page
      const nextCursor = this.extractCursorFromLinks(response.links);
      if (!nextCursor) break;
      pageCursor = nextCursor;
      pagesFetched++;
    }

    return matches;
  }

  // ──────────────────────────────────────────────
  // Components API (requires X-Version: 1 header)
  // ──────────────────────────────────────────────

  /**
   * Fetch all components (for hierarchy context)
   */
  async fetchComponents(): Promise<
    Array<{ id: string; name: string; description?: string; parent?: unknown }>
  > {
    const allComponents: Array<{
      id: string;
      name: string;
      description?: string;
      parent?: unknown;
    }> = [];
    let pageCursor: string | undefined;
    let pagesFetched = 0;

    while (pagesFetched < 20) {
      const params: Record<string, string> = {};
      if (pageCursor) params.pageCursor = pageCursor;

      const response = await this.get(
        "/components",
        params,
        ProductBoardApiClient.VERSION_HEADER
      );

      if (!response.ok) break;

      const body = await response.json();
      allComponents.push(...(body.data || []));

      const nextCursor = this.extractCursorFromLinks(body.links);
      if (!nextCursor) break;
      pageCursor = nextCursor;
      pagesFetched++;
    }

    return allComponents;
  }

  // ──────────────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────────────

  /**
   * Extract page cursor from API response links
   */
  extractPageCursor(links: ProductBoardApiResponse["links"]): string | null {
    return this.extractCursorFromLinks(links);
  }

  private extractCursorFromLinks(
    links?: { next?: string | { href: string } } | null
  ): string | null {
    if (!links) return null;

    const nextLink = links.next;
    if (!nextLink) return null;

    try {
      const href =
        typeof nextLink === "string" ? nextLink : nextLink.href;
      const urlObj = new URL(href);
      return urlObj.searchParams.get("pageCursor");
    } catch {
      return null;
    }
  }
}
