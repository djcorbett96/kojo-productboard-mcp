# Productboard MCP Server

MCP server that lets Claude fetch and filter notes from Productboard.

## Setup

1. Clone and build:

```bash
git clone git@github.com:djcorbett96/kojo-productboard-mcp.git
cd kojo-productboard-mcp
npm install
npm run build
```

2. Get a Productboard API token from your workspace admin settings under **Integrations > Notes API**.

3. Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "productboard": {
      "command": "node",
      "args": ["/path/to/kojo-productboard-mcp/build/index.js"],
      "env": {
        "PRODUCTBOARD_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

Claude Code launches the server automatically — no need to run it manually.

## Tool: `fetch_notes`

Fetches notes from Productboard with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tags` | string[] | Filter to notes containing at least one of these tags |
| `keywords` | string | Full-text search on note titles and content |
| `createdFrom` | string | Notes created on/after this date — `"past month"`, `"past week"`, `"past 7 days"`, or `"2024-01-15"` |
| `limit` | number | Max notes to return (default: 100, max: 1000) |

All parameters are optional. The server handles pagination automatically.
