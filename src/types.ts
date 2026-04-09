/**
 * TypeScript types for ProductBoard API responses
 */

// ──────────────────────────────────────────────
// Notes
// ──────────────────────────────────────────────

export interface ProductBoardNote {
  id: string;
  title?: string;
  content?: string;
  state?: string;
  tags?: NoteTag[];
  features?: Array<{ id: string; type?: string; importance?: number }>;
  displayUrl?: string;
  company?: unknown;
  owner?: unknown;
  source?: unknown;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
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
  totalResults?: number;
  pageCursor?: string;
  [key: string]: unknown;
}

export interface FetchNotesParams {
  tags?: string[];
  keywords?: string;
  createdFrom?: string;
  state?: "processed" | "unprocessed";
  limit?: number;
}

export interface FetchNotesResult {
  count: number;
  totalFetched: number;
  notes: ProductBoardNote[];
}

// ──────────────────────────────────────────────
// Features
// ──────────────────────────────────────────────

export interface ProductBoardFeature {
  id: string;
  name: string;
  description?: string;
  type?: string; // "feature" | "subfeature"
  status?: {
    id: string;
    name?: string;
  };
  parent?: {
    component?: { id: string; links?: { self: string } };
    feature?: { id: string; links?: { self: string } };
  };
  links?: {
    self?: string;
    html?: string;
  };
  archived?: boolean;
  owner?: { email?: string };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ProductBoardFeaturesApiResponse {
  data?: ProductBoardFeature[];
  links?: {
    next?: string | { href: string };
  };
  [key: string]: unknown;
}

export interface SearchFeaturesParams {
  query: string;
  limit?: number;
}

export interface SearchFeaturesResult {
  count: number;
  features: ProductBoardFeature[];
}

export interface CreateFeatureParams {
  name: string;
  description?: string;
  parentComponentId?: string;
  statusId?: string;
}

export interface CreateFeatureResult {
  feature: ProductBoardFeature;
}

export interface LinkNoteToFeatureParams {
  noteId: string;
  featureId: string;
}

export interface LinkNoteToFeatureResult {
  success: boolean;
  noteId: string;
  featureId: string;
}
