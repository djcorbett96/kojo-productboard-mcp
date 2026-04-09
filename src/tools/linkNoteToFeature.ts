/**
 * link_note_to_feature tool implementation
 */

import { z } from "zod";
import type { LinkNoteToFeatureResult } from "../types.js";
import { ProductBoardApiClient } from "../api/client.js";

export const linkNoteToFeatureInputSchema = {
  noteId: z
    .string()
    .min(1)
    .describe("The ID of the note to link."),
  featureId: z
    .string()
    .min(1)
    .describe("The ID of the feature to link the note to."),
} as const;

export const linkNoteToFeatureDescription =
  "Link a customer feedback note to a feature in ProductBoard. This associates the note with the feature for tracking and prioritization. The note will appear as evidence on the feature.";

/**
 * Execute the link_note_to_feature tool
 */
export async function executeLinkNoteToFeature(
  client: ProductBoardApiClient,
  params: { noteId: string; featureId: string }
): Promise<LinkNoteToFeatureResult> {
  return client.linkNoteToFeature(params.noteId, params.featureId);
}
