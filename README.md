# ProductBoard MCP Server

An MCP (Model Context Protocol) server that enables LLMs to interact with ProductBoard, specifically for fetching and filtering Notes by tags and keywords.

## Features

- **Fetch Notes**: Retrieve notes from your ProductBoard workspace with automatic pagination
- **Tag Filtering**: Filter notes by specific tags to get insights into customer requests for particular product areas
- **Keyword Search**: Full-text search across note titles and content
- **Configurable Limits**: Control the number of notes returned (default: 100, max: 1000)
- **Automatic Pagination**: Automatically fetches multiple pages to retrieve the requested number of notes

## Prerequisites

1. **ProductBoard API Token**: You need a developer token from ProductBoard

   - As a workspace admin, navigate to Integrations page in your ProductBoard workspace settings
   - Generate a developer token for API access
   - See: https://www.productboard.com/integrations/notes-api/

2. **Node.js**: This project requires Node.js (v18 or higher recommended)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

## Configuration

Set the `PRODUCTBOARD_API_TOKEN` environment variable with your ProductBoard developer token:

```bash
export PRODUCTBOARD_API_TOKEN="your-token-here"
```

## Usage

### Running the Server

The server runs on stdio and communicates via the MCP protocol:

```bash
npm start
```

Or directly:

```bash
node build/index.js
```

### Connecting to Cursor

To use this MCP server with Cursor IDE:

1. **Open Cursor Settings**:

   - Go to `File` → `Preferences` → `Cursor Settings` (or `Cmd/Ctrl + ,`)
   - Navigate to the `MCP` section

2. **Add the MCP Server**:
   - Click `Add new global MCP server` or edit your MCP settings JSON
   - Add the following configuration:

```json
{
  "mcpServers": {
    "productboard": {
      "command": "node",
      "args": [
        "/Users/djcorbettkojo/Documents/code/productboard-mcp/build/index.js"
      ],
      "env": {
        "PRODUCTBOARD_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

**Important**: Replace:

- The path to `build/index.js` with your actual project path
- `"your-token-here"` with your actual ProductBoard API token

3. **Alternative: Use npm script** (if you prefer):

```json
{
  "mcpServers": {
    "productboard": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/Users/djcorbettkojo/Documents/code/productboard-mcp",
      "env": {
        "PRODUCTBOARD_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

4. **Restart Cursor** to apply the changes

5. **Verify Connection**:
   - The MCP server should appear in Cursor's MCP status
   - You can now ask Cursor to fetch notes from ProductBoard using natural language

### MCP Tool: `fetch_notes`

The server provides a single tool called `fetch_notes` that can be used by LLMs to retrieve notes from ProductBoard.

#### Parameters

- **tags** (optional, array of strings): List of tags to filter notes. If provided, only notes containing at least one of these tags will be returned.
- **keywords** (optional, string): Keyword search term. Performs full-text search on note titles and content. Only notes containing the keyword will be returned.
- **createdFrom** (optional, string): Filter notes created on or after this date. Supports relative dates like "past month", "past week", "past 7 days", "past 30 days", or absolute dates in ISO format like "2024-01-15". Examples: "past month", "past week", "past 7 days", "2024-01-15".
- **limit** (optional, number): Maximum number of notes to return. Default: 100, Max: 1000

#### Example Usage

Fetch all notes (up to 100):

```json
{
  "name": "fetch_notes",
  "arguments": {}
}
```

Fetch notes filtered by specific tags:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "tags": ["feature-request", "mobile-app"],
    "limit": 50
  }
}
```

Search notes by keywords:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "keywords": "authentication",
    "limit": 100
  }
}
```

Combine tags and keywords:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "keywords": "dark mode",
    "tags": ["ui", "feature-request"],
    "limit": 200
  }
}
```

Fetch notes from the past month with specific tags:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "tags": ["AP", "feature-request"],
    "createdFrom": "past month",
    "limit": 100
  }
}
```

Fetch notes from the past week with keywords:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "keywords": "authentication",
    "createdFrom": "past week",
    "limit": 50
  }
}
```

Fetch notes from a specific date:

```json
{
  "name": "fetch_notes",
  "arguments": {
    "tags": ["mobile"],
    "createdFrom": "2024-01-15",
    "limit": 200
  }
}
```

#### Response Format

The tool returns a JSON object with:

- `count`: Number of notes returned (after filtering and limiting)
- `totalFetched`: Total number of notes fetched from all pages (before filtering)
- `notes`: Array of note objects from ProductBoard

## Development

### Project Structure

```
productboard-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── build/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

The compiled output will be in the `build/` directory.

## Example Queries in Cursor

Once connected, you can ask Cursor questions like:

- "Fetch the last 50 notes from ProductBoard about mobile features"
- "Get all notes tagged with 'security' that mention 'authentication'"
- "Show me customer feedback about dark mode with the 'ui' tag"
- "What are the top 100 feature requests related to the mobile app?"
- "Summarize new feature requests tagged with 'AP' from the past month"
- "Get all notes from the past week about authentication"
- "Show me notes created since January 15th, 2024 with the 'mobile' tag"

Cursor will automatically use the `fetch_notes` tool with appropriate parameters.

## API Reference

The server uses the ProductBoard Notes API:

- Endpoint: `https://api.productboard.com/notes`
- Authentication: Bearer token via `Authorization` header
- Search: Uses `term` query parameter for keyword search
- Pagination: Cursor-based pagination via `pageCursor` parameter
- Documentation: https://developer.productboard.com/docs

## Error Handling

The server handles various error scenarios:

- Missing API token (exits on startup)
- API authentication failures
- Network errors
- Invalid responses

All errors are returned to the MCP client with descriptive error messages.

## License

ISC
