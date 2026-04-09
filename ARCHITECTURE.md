# Architecture & Best Practices

This document outlines the architecture and best practices implemented in the ProductBoard MCP server.

## Project Structure

```
src/
├── index.ts              # Main server entry point - registers tools and starts server
├── config.ts             # Configuration constants and environment variable handling
├── types.ts              # TypeScript type definitions for API responses
├── api/
│   └── client.ts         # ProductBoard API client - handles all HTTP requests
├── tools/
│   └── fetchNotes.ts     # fetch_notes tool implementation
└── utils/
    └── pagination.ts     # Pagination utilities and note filtering
```

## Best Practices Implemented

### 1. **Modular Code Organization**
- **Separation of Concerns**: Each module has a single responsibility
  - `api/client.ts`: All API communication
  - `tools/`: Individual tool implementations
  - `utils/`: Reusable utility functions
  - `config.ts`: Centralized configuration
  - `types.ts`: Type definitions

### 2. **Type Safety**
- Replaced all `any` types with proper TypeScript interfaces
- Defined types in `types.ts` for:
  - `ProductBoardNote`: Note structure
  - `NoteTag`: Tag structure
  - `ProductBoardApiResponse`: API response structure
  - `FetchNotesParams`: Tool input parameters
  - `FetchNotesResult`: Tool output structure

### 3. **API Client Abstraction**
- Centralized API client (`ProductBoardApiClient`) that:
  - Handles authentication
  - Manages HTTP requests
  - Extracts pagination cursors
  - Can be easily extended for new endpoints (features, associations, etc.)

### 4. **Tool Organization**
- Each tool in its own file under `tools/`
- Tool files export:
  - Input schema (Zod validation)
  - Description
  - Execution function
- Makes it easy to add new tools (e.g., `fetchFeatures.ts`, `associateNote.ts`)

### 5. **Reusable Utilities**
- Pagination logic extracted to `utils/pagination.ts`
- Tag filtering logic reusable across tools
- Can be easily tested independently

### 6. **Configuration Management**
- All constants in `config.ts`
- Environment variable validation with clear error messages
- Easy to modify limits, defaults, etc.

## Adding New Tools

To add a new tool (e.g., `fetch_features`):

1. **Create tool file**: `src/tools/fetchFeatures.ts`
   ```typescript
   export const fetchFeaturesInputSchema = { ... };
   export const fetchFeaturesDescription = "...";
   export async function executeFetchFeatures(...) { ... }
   ```

2. **Add API method** (if needed): `src/api/client.ts`
   ```typescript
   async fetchFeatures(params: {...}): Promise<...> { ... }
   ```

3. **Register in** `src/index.ts`:
   ```typescript
   import { fetchFeaturesInputSchema, ... } from "./tools/fetchFeatures.js";
   
   server.registerTool("fetch_features", {
     description: fetchFeaturesDescription,
     inputSchema: fetchFeaturesInputSchema,
   }, async (params) => {
     // Handle tool execution
   });
   ```

## Benefits of This Structure

1. **Scalability**: Easy to add new tools without touching existing code
2. **Maintainability**: Clear separation makes code easier to understand and modify
3. **Testability**: Each module can be tested independently
4. **Type Safety**: TypeScript catches errors at compile time
5. **Reusability**: API client and utilities can be shared across tools
6. **Readability**: Code is self-documenting with clear module boundaries

## Future Enhancements

When adding features like:
- Reading features
- Associating notes with features
- Creating/updating notes
- Managing tags

Follow the same pattern:
- Add types to `types.ts`
- Add API methods to `api/client.ts`
- Create tool file in `tools/`
- Register in `index.ts`

This keeps the codebase organized and maintainable as it grows.









