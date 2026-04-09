/**
 * Pagination utilities for ProductBoard API
 */

import type { ProductBoardNote, ProductBoardApiResponse } from "../types.js";
import { ProductBoardApiClient } from "../api/client.js";
import { MAX_PAGES_TO_FETCH } from "../config.js";

export interface PaginationOptions {
  keywords?: string;
  tags?: string[];
  createdFrom?: string; // Date in YYYY-MM-DD format
  limit: number;
}

export interface PaginationResult {
  notes: ProductBoardNote[];
  totalFetched: number;
}

/**
 * Fetch notes with automatic pagination
 */
export async function fetchAllNotes(
  client: ProductBoardApiClient,
  options: PaginationOptions
): Promise<PaginationResult> {
  const { keywords, tags, limit } = options;
  
  let allNotes: ProductBoardNote[] = [];
  let pageCursor: string | null = null;
  let hasMorePages = true;
  let pagesFetched = 0;

  while (hasMorePages && pagesFetched < MAX_PAGES_TO_FETCH) {
    const response = await client.fetchNotes({
      term: keywords,
      createdFrom: options.createdFrom,
      pageCursor: pageCursor || undefined,
    });

    const pageNotes = response.data || response.notes || [];
    allNotes.push(...pageNotes);
    pagesFetched++;

    // Check if we have enough notes
    // Note: Keywords and createdFrom are already filtered by the API
    if ((!tags || tags.length === 0) && !keywords && !options.createdFrom) {
      // Without any filtering, stop once we have enough notes
      if (allNotes.length >= limit) {
        hasMorePages = false;
        break;
      }
    } else {
      // With filtering (tags, keywords, or date), check if we have enough matching notes
      // Note: Keywords and createdFrom are already filtered by the API, but we still need to check tags
      let matchingNotes = allNotes;
      if (tags && tags.length > 0) {
        matchingNotes = filterNotesByTags(allNotes, tags);
      }
      if (matchingNotes.length >= limit) {
        hasMorePages = false;
        break;
      }
    }

    // Check for next page
    pageCursor = client.extractPageCursor(response.links);
    hasMorePages = pageCursor !== null;
  }

  return {
    notes: allNotes,
    totalFetched: allNotes.length,
  };
}

/**
 * Filter notes by tags (case-insensitive)
 */
export function filterNotesByTags(
  notes: ProductBoardNote[],
  tags: string[]
): ProductBoardNote[] {
  return notes.filter((note) => {
    const noteTags = note.tags || [];
    return tags.some((tag) =>
      noteTags.some((noteTag) => {
        const tagName =
          typeof noteTag === "string"
            ? noteTag
            : noteTag.name || noteTag.value;
        return tagName?.toLowerCase() === tag.toLowerCase();
      })
    );
  });
}

