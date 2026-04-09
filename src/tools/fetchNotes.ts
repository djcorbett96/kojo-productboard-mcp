/**
 * fetch_notes tool implementation
 */

import { z } from "zod";
import type { FetchNotesParams, FetchNotesResult } from "../types.js";
import { ProductBoardApiClient } from "../api/client.js";
import { fetchAllNotes, filterNotesByTags } from "../utils/pagination.js";
import { DEFAULT_LIMIT, MAX_LIMIT } from "../config.js";
import { parseDateFilter } from "../utils/dateFilter.js";

export const fetchNotesInputSchema = {
  tags: z
    .array(z.string())
    .optional()
    .describe(
      "Optional list of tags to filter notes. If provided, only notes containing at least one of these tags will be returned."
    ),
  keywords: z
    .string()
    .optional()
    .describe(
      "Optional keyword search term. Performs full-text search on note titles and content. Only notes containing the keyword will be returned."
    ),
  createdFrom: z
    .string()
    .optional()
    .describe(
      'Optional date filter for notes created on or after this date. Supports relative dates like "past month", "past week", "past 7 days", "past 30 days", or absolute dates in ISO format like "2024-01-15". Examples: "past month", "past week", "past 7 days", "2024-01-15".'
    ),
  state: z
    .enum(["processed", "unprocessed"])
    .optional()
    .describe(
      'Filter notes by processing state. Use "unprocessed" to find notes that have not been triaged yet.'
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT)
    .describe(
      `Maximum number of notes to return (default: ${DEFAULT_LIMIT}, max: ${MAX_LIMIT})`
    ),
} as const;

export const fetchNotesDescription =
  "Fetch notes from ProductBoard, optionally filtered by tags, keywords, and/or creation date. Automatically paginates through all pages to retrieve the requested number of notes. Returns customer feedback and insights for specific product areas. Use createdFrom to filter notes from a specific time period (e.g., 'past month', 'past week', 'past 7 days').";

/**
 * Execute the fetch_notes tool
 */
export async function executeFetchNotes(
  client: ProductBoardApiClient,
  params: FetchNotesParams
): Promise<FetchNotesResult> {
  const { tags, keywords, createdFrom, state, limit = DEFAULT_LIMIT } = params;

  // Parse date filter if provided
  let createdFromDate: string | undefined;
  if (createdFrom) {
    try {
      createdFromDate = parseDateFilter(createdFrom);
    } catch (error) {
      throw new Error(
        `Invalid date filter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Fetch all notes with pagination
  const { notes: allNotes, totalFetched } = await fetchAllNotes(client, {
    keywords,
    tags,
    state,
    createdFrom: createdFromDate,
    limit,
  });

  // Apply tag filtering if needed (keywords are already filtered by API)
  let filteredNotes = allNotes;
  if (tags && tags.length > 0) {
    filteredNotes = filterNotesByTags(allNotes, tags);
  }

  // Apply limit
  const notes = filteredNotes.slice(0, limit);

  return {
    count: notes.length,
    totalFetched,
    notes,
  };
}

