/**
 * create_feature tool implementation
 */

import { z } from "zod";
import type { CreateFeatureResult } from "../types.js";
import { ProductBoardApiClient } from "../api/client.js";
import {
  TRIAGE_PARENT_COMPONENT_ID,
  DEFAULT_FEATURE_STATUS_ID,
} from "../config.js";

export const createFeatureInputSchema = {
  name: z
    .string()
    .min(1)
    .describe("The name/title of the new feature."),
  description: z
    .string()
    .optional()
    .describe("Optional description of the feature. Supports HTML."),
  parentComponentId: z
    .string()
    .optional()
    .describe(
      "Component ID to place the feature under. Defaults to the configured triage component (PRODUCTBOARD_TRIAGE_COMPONENT_ID env var)."
    ),
  statusId: z
    .string()
    .optional()
    .describe(
      'Feature status ID. Defaults to the configured default status (PRODUCTBOARD_DEFAULT_STATUS_ID env var, typically "New idea").'
    ),
} as const;

export const createFeatureDescription =
  'Create a new feature in ProductBoard. By default places it under the configured triage component with "New idea" status. Requires PRODUCTBOARD_TRIAGE_COMPONENT_ID and PRODUCTBOARD_DEFAULT_STATUS_ID environment variables to be set for defaults.';

/**
 * Execute the create_feature tool
 */
export async function executeCreateFeature(
  client: ProductBoardApiClient,
  params: {
    name: string;
    description?: string;
    parentComponentId?: string;
    statusId?: string;
  }
): Promise<CreateFeatureResult> {
  const parentComponentId =
    params.parentComponentId || TRIAGE_PARENT_COMPONENT_ID;
  const statusId = params.statusId || DEFAULT_FEATURE_STATUS_ID;

  if (!parentComponentId) {
    throw new Error(
      "No parent component ID provided and PRODUCTBOARD_TRIAGE_COMPONENT_ID is not set. " +
        "Either pass parentComponentId or set the environment variable."
    );
  }

  if (!statusId) {
    throw new Error(
      "No status ID provided and PRODUCTBOARD_DEFAULT_STATUS_ID is not set. " +
        "Either pass statusId or set the environment variable."
    );
  }

  const feature = await client.createFeature({
    name: params.name,
    description: params.description,
    parentComponentId,
    statusId,
  });

  return { feature };
}
