/**
 * search_features tool implementation
 */

import { z } from "zod";
import type { SearchFeaturesResult } from "../types.js";
import { ProductBoardApiClient } from "../api/client.js";

export const searchFeaturesInputSchema = {
  query: z
    .string()
    .min(1)
    .describe(
      "Search term to match against feature names and descriptions. Performs case-insensitive substring matching."
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Maximum number of matching features to return (default: 25, max: 100)"),
} as const;

export const searchFeaturesDescription =
  "Search for existing features in ProductBoard by keyword. Paginates through all features and performs client-side matching on names and descriptions. Use this to find features that match customer feedback notes before creating new ones. Returns feature names, IDs, descriptions, status, and parent component info.";

/**
 * Execute the search_features tool
 */
export async function executeSearchFeatures(
  client: ProductBoardApiClient,
  params: { query: string; limit?: number }
): Promise<SearchFeaturesResult> {
  const { query, limit = 25 } = params;

  const features = await client.searchFeatures(query, limit);

  return {
    count: features.length,
    features: features.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
      type: f.type,
      status: f.status,
      parent: f.parent,
      links: f.links,
      archived: f.archived,
      owner: f.owner,
    })),
  };
}
