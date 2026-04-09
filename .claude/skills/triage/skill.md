---
name: triage
description: >
  Triage unprocessed Productboard notes. Matches notes to existing features,
  proposes new features when no match exists, and links notes after approval.
  Use regularly to keep the backlog organized.
allowedTools:
  - mcp__productboard__fetch_notes
  - mcp__productboard__search_features
---

# Triage

Triage unprocessed customer feedback notes from Productboard. Match notes to existing features, propose new features when no match exists, and execute approved actions.

## Arguments

`$ARGUMENTS` may specify:
- **Product area tags** to filter (required on first use — e.g., "Warehouse, Procurement")
- **Time range** (default: `"past week"`)
- **Max notes** to triage (default: 30)

Parse overrides from arguments. Examples:
- `/triage Warehouse` — triage Warehouse notes from the past week
- `/triage AP, Platform past month` — triage AP and Platform notes from the past month
- `/triage` with no arguments — ask the user which product area tags to filter by

## Phase 1: Fetch Untriaged Notes

Call `mcp__productboard__fetch_notes` with:
- `state: "unprocessed"`
- `tags`: the target product areas from arguments
- `createdFrom`: the time range (default `"past week"`)
- `limit`: max notes (default 30)

If zero notes are returned:
- Report "No unprocessed notes found for [areas] in [time range]."
- Suggest trying a broader time range or different tags.
- Stop here.

## Phase 2: Match Notes to Features

For each untriaged note:

1. **Extract key phrases** from the note title and content — identify the core ask, problem, or feature area the customer is describing.

2. **Search for matching features** — Call `mcp__productboard__search_features` with the key phrases. Try 2-3 variations if the first search yields no good matches (synonyms, broader terms, specific terms).

3. **Evaluate matches** using your judgment:
   - **High confidence match**: Feature name/description clearly addresses the same problem or capability the note describes. The customer's ask maps directly to this feature.
   - **Low confidence match**: Feature is in the same area but the note might be asking for something different or more specific.
   - **No match**: Nothing in the existing feature set addresses what this note describes.

4. **For no-match notes**, draft a proposed new feature:
   - Name: concise, action-oriented (e.g., "Bulk invoice approval from list view")
   - Description: 1-2 sentences summarizing the need based on the note content

## Phase 3: Present Triage Report

Present findings in a structured report. Group notes into three categories:

### Link to Existing Feature
For each note with a high-confidence match:
```
- **Note**: "[note title]" (ID: [noteId])
  **Match**: [feature name] (ID: [featureId])
  **Confidence**: High — [brief reason]
```

### Create New Feature + Link
For each note with no match:
```
- **Note**: "[note title]" (ID: [noteId])
  **Proposed feature**: [proposed name]
  **Description**: [proposed description]
```

### Needs Manual Review
For each note with low-confidence or ambiguous matches:
```
- **Note**: "[note title]" (ID: [noteId])
  **Candidates**: [feature 1 name], [feature 2 name]
  **Issue**: [why it's ambiguous — e.g., "could be either feature", "note spans multiple areas"]
```

End with a summary:
```
Summary: X notes to link, Y new features to create, Z need manual review
```

**Wait for explicit user approval before proceeding.** The user may:
- Approve all actions
- Modify specific assignments (move a note from one category to another, change a match)
- Skip certain notes
- Edit proposed feature names/descriptions

Incorporate all feedback before executing.

## Phase 4: Execute Approved Actions

After approval, execute in this order:

1. **Create new features first** (if any):
   - Call `mcp__productboard__create_feature` for each approved new feature
   - Record the returned feature IDs for linking

2. **Link notes to features**:
   - Call `mcp__productboard__link_note_to_feature` for each approved link
   - This includes both existing-feature matches and newly-created features

3. **Report results**:
   ```
   Triage complete:
   - X notes linked to existing features
   - Y new features created and linked
   - Z notes skipped for manual review
   ```

If any action fails, report the error but continue with remaining actions. Summarize failures at the end.

## Important Notes

- **Never auto-execute** — always present the report and wait for approval
- **Be conservative with matches** — when in doubt, put it in "Needs Manual Review" rather than forcing a bad match
- **Respect rate limits** — don't fire all search_features calls in parallel; batch them in groups of 3-5
- The `create_feature` tool requires `PRODUCTBOARD_TRIAGE_COMPONENT_ID` and `PRODUCTBOARD_DEFAULT_STATUS_ID` env vars to be configured. If they're missing, warn the user and skip feature creation.
