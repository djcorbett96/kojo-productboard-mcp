/**
 * ProductBoard MCP Server
 * Main entry point for the MCP server
 */

import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Load environment variables from .env file (for local development)
config();

import { getApiToken } from "./config.js";
import { ProductBoardApiClient } from "./api/client.js";
import {
  fetchNotesInputSchema,
  fetchNotesDescription,
  executeFetchNotes,
} from "./tools/fetchNotes.js";
import {
  searchFeaturesInputSchema,
  searchFeaturesDescription,
  executeSearchFeatures,
} from "./tools/searchFeatures.js";
import {
  createFeatureInputSchema,
  createFeatureDescription,
  executeCreateFeature,
} from "./tools/createFeature.js";
import {
  linkNoteToFeatureInputSchema,
  linkNoteToFeatureDescription,
  executeLinkNoteToFeature,
} from "./tools/linkNoteToFeature.js";

// Initialize API client
let apiClient: ProductBoardApiClient;
try {
  const apiToken = getApiToken();
  apiClient = new ProductBoardApiClient(apiToken);
} catch (error) {
  console.error(
    "Error:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Create server instance
const server = new McpServer({
  name: "productboard",
  version: "1.0.0",
});

// Register tools
server.registerTool(
  "fetch_notes",
  {
    description: fetchNotesDescription,
    inputSchema: fetchNotesInputSchema,
  },
  async (params) => {
    try {
      const result = await executeFetchNotes(apiClient, params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching notes: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Register search_features tool
server.registerTool(
  "search_features",
  {
    description: searchFeaturesDescription,
    inputSchema: searchFeaturesInputSchema,
  },
  async (params) => {
    try {
      const result = await executeSearchFeatures(apiClient, params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching features: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Register create_feature tool
server.registerTool(
  "create_feature",
  {
    description: createFeatureDescription,
    inputSchema: createFeatureInputSchema,
  },
  async (params) => {
    try {
      const result = await executeCreateFeature(apiClient, params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating feature: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Register link_note_to_feature tool
server.registerTool(
  "link_note_to_feature",
  {
    description: linkNoteToFeatureDescription,
    inputSchema: linkNoteToFeatureInputSchema,
  },
  async (params) => {
    try {
      const result = await executeLinkNoteToFeature(apiClient, params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error linking note to feature: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ProductBoard MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
