/**
 * TypeScript types for ProductBoard API responses
 */

export interface ProductBoardNote {
  id: string;
  title?: string;
  content?: string;
  tags?: NoteTag[];
  [key: string]: unknown; // Allow other fields from API
}

export interface NoteTag {
  name?: string;
  value?: string;
  [key: string]: unknown;
}

export interface ProductBoardApiResponse {
  data?: ProductBoardNote[];
  notes?: ProductBoardNote[];
  links?: {
    next?: string | { href: string };
  };
  [key: string]: unknown;
}

export interface FetchNotesParams {
  tags?: string[];
  keywords?: string;
  createdFrom?: string; // Date expression like "past month", "past week", "past 7 days", or ISO date "2024-01-15"
  limit?: number;
}

export interface FetchNotesResult {
  count: number;
  totalFetched: number;
  notes: ProductBoardNote[];
}

