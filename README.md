# Productboard MCP Server

MCP server that lets Claude Code fetch notes, search features, create features, and link notes to features in Productboard. Includes a triage skill for processing customer feedback.

## Setup

1. Clone and build:

```bash
git clone git@github.com:djcorbett96/kojo-productboard-mcp.git
cd kojo-productboard-mcp
npm install
npm run build
```

2. Get a Productboard API token from your workspace admin settings under **Integrations > Notes API**.

3. Add to your Claude Code MCP config (`.mcp.json` in your project root or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "productboard": {
      "command": "node",
      "args": ["/path/to/kojo-productboard-mcp/build/index.js"],
      "env": {
        "PRODUCTBOARD_API_TOKEN": "your-token-here",
        "PRODUCTBOARD_TRIAGE_COMPONENT_ID": "",
        "PRODUCTBOARD_DEFAULT_STATUS_ID": ""
      }
    }
  }
}
```

| Env Variable | Required | Description |
|---|---|---|
| `PRODUCTBOARD_API_TOKEN` | Yes | Your Productboard API token |
| `PRODUCTBOARD_TRIAGE_COMPONENT_ID` | For feature creation | Component ID where new triage features are created. Find this in Productboard's feature board URL or via the API. |
| `PRODUCTBOARD_DEFAULT_STATUS_ID` | For feature creation | Status ID for new features (e.g., "New idea"). Use `GET /feature-statuses` with `X-Version: 1` header to list available statuses. |

Claude Code launches the server automatically -- no need to run it manually.

## Tools

### `fetch_notes`

Fetches notes from Productboard with optional filtering.

| Parameter | Type | Description |
|-----------|------|-------------|
| `tags` | string[] | Filter to notes containing at least one of these tags |
| `keywords` | string | Full-text search on note titles and content |
| `createdFrom` | string | Notes created on/after this date -- `"past month"`, `"past week"`, `"past 7 days"`, or `"2024-01-15"` |
| `state` | string | Filter by processing state: `"processed"` or `"unprocessed"` |
| `limit` | number | Max notes to return (default: 100, max: 1000) |

All parameters are optional. The server handles pagination automatically.

### `search_features`

Searches existing features by keyword. Paginates through all features and performs client-side matching on names and descriptions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search term to match against feature names and descriptions (required) |
| `limit` | number | Max matching features to return (default: 25, max: 100) |

### `create_feature`

Creates a new feature in Productboard. Requires `PRODUCTBOARD_TRIAGE_COMPONENT_ID` and `PRODUCTBOARD_DEFAULT_STATUS_ID` env vars.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Feature name (required) |
| `description` | string | Feature description (supports HTML) |
| `parentComponentId` | string | Override the default triage component |
| `statusId` | string | Override the default status |

### `link_note_to_feature`

Links a customer feedback note to a feature for tracking and prioritization.

| Parameter | Type | Description |
|-----------|------|-------------|
| `noteId` | string | The note ID to link (required) |
| `featureId` | string | The feature ID to link to (required) |

## Triage Skill

The repo includes a Claude Code skill for triaging unprocessed Productboard notes. It fetches notes, matches them to existing features, proposes new features when needed, and waits for your approval before taking action.

### Skill Setup

Copy the skill into your project's Claude Code skills directory:

```bash
cp -r /path/to/kojo-productboard-mcp/.claude/skills/triage /your/project/.claude/skills/triage
```

Or symlink it:

```bash
ln -s /path/to/kojo-productboard-mcp/.claude/skills/triage /your/project/.claude/skills/triage
```

### Usage

Run the skill in Claude Code with your product area tags:

```
/triage Warehouse, Procurement
/triage AP past month
/triage Platform, Integrations past 2 weeks
```

The skill will:
1. Fetch unprocessed notes matching your tags
2. Search for existing features that match each note
3. Present a triage report with proposed actions (link to existing feature, create new feature, or flag for manual review)
4. **Wait for your approval** before creating any features or linking any notes

The `fetch_notes` and `search_features` calls are pre-approved in the skill config. You'll only be prompted to approve `create_feature` and `link_note_to_feature` calls.
