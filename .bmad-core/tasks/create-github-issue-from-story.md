<!-- Powered by BMAD™ Core -->

# Create GitHub Issue from Story Task

## Purpose

To create a GitHub Issue as the primary source of truth for a story, using the Issue template format defined in CLAUDE.md. This task maps story data (from epic requirements, acceptance criteria, tasks) to the GitHub Issue format and creates the Issue via `gh` CLI.

The GitHub Issue serves as the single source of truth for:
- Workflow tracking (branches, commits, PR comments, closure)
- Team collaboration and comments
- Issue-first Git Flow (as defined in CLAUDE.md)

## Prerequisites

- `gh` CLI installed and authenticated
- GitHub repository accessible
- Story data gathered (epic number, story number, title, AC, tasks, etc.)
- CLAUDE.md defines the Issue template structure

## Input Parameters

This task expects the following data to be gathered before execution:

- `epicNum`: Epic number (e.g., 1, 2, 3)
- `storyNum`: Story number within epic (e.g., 1, 2, 3)
- `storyTitle`: Short descriptive title
- `context`: Background and problem framing
- `goals`: List of success criteria (bullet points)
- `nonGoals`: Explicitly out-of-scope items
- `acceptanceCriteria`: Given/When/Then format criteria
- `approachSketch`: High-level implementation plan
- `risksAndMitigations`: Security, performance, data migration concerns
- `testPlan`: Unit/integration/manual test approach
- `dependencies`: External services, secrets, env vars required
- `assetsAndLinks`: Related docs, designs, architecture references
- `sizeEstimate`: T-shirt size (S/M/L/XL)
- `moduleArea`: Module/domain for labeling (e.g., "ingestion", "backend", "frontend")

## SEQUENTIAL Task Execution

### 1. Verify GitHub CLI Access

- Check `gh` CLI is installed: `gh --version`
- Verify authentication: `gh auth status`
- If not authenticated, HALT and inform user: "GitHub CLI not authenticated. Run: gh auth login"
- Verify repository access: `gh repo view` (should show current repo)

### 2. Build GitHub Issue Body

Construct the Issue body using the CLAUDE.md template format:

```markdown
## Context
{context}

## Goals
{goals_list}

## Non-Goals
{nonGoals_list}

## Acceptance Criteria (Given/When/Then)
{acceptanceCriteria_formatted}

## Approach Sketch
{approachSketch_formatted}

## Risks & Mitigations
{risksAndMitigations_formatted}

## Test Plan
{testPlan_formatted}

## Dependencies
{dependencies_list}

## Assets & Links
- Epic: Epic {epicNum}
- Local Story File: `docs/stories/{epicNum}.{storyNum}.{slug}.md`
- Architecture References: {architectureReferences}

## Estimate & Target
- Size: {sizeEstimate}
- Epic: {epicNum}
- Story: {storyNum}
- Sprint: {sprintTarget}
```

**Formatting Rules:**
- Convert bullet lists to markdown list format (- item)
- Ensure Given/When/Then are on separate lines
- Include source references from architecture docs where applicable
- Escape special characters that might break HEREDOC (backticks, quotes)

### 3. Determine Story Type and Labels

Based on story content and epic context:

**Type Labels:**
- `type:feature` - New functionality (default for most stories)
- `type:bug` - Bug fix stories
- `type:chore` - Infrastructure, build, or tooling
- `type:refactor` - Code refactoring without behavior change
- `type:docs` - Documentation updates
- `type:perf` - Performance improvements
- `type:test` - Test additions or improvements

**Area Labels:**
- Extract from `moduleArea` parameter
- Format: `area:{module}` (e.g., `area:ingestion`, `area:backend`, `area:frontend`)

**Epic Labels:**
- Format: `epic:{epicNum}` (e.g., `epic:1`, `epic:2`)

### 4. Create GitHub Issue via CLI

Execute `gh issue create` with properly formatted body:

```bash
gh issue create \
  --title "Story {epicNum}.{storyNum}: {storyTitle}" \
  --body "$(cat <<'ISSUE_EOF'
{issue_body_from_step_2}
ISSUE_EOF
)" \
  --label "type:feature" \
  --label "area:{moduleArea}" \
  --label "epic:{epicNum}"
```

**CRITICAL:**
- Use HEREDOC with single quotes (<<'ISSUE_EOF') to prevent shell expansion
- Ensure proper escaping of special characters in issue body
- If body contains backticks or quotes, escape appropriately

### 5. Capture Issue Details

After successful creation:

```bash
# Capture Issue number from gh output
ISSUE_NUM=$(gh issue list --limit 1 --json number --jq '.[0].number')

# Build Issue URL
REPO_FULL=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
ISSUE_URL="https://github.com/${REPO_FULL}/issues/${ISSUE_NUM}"
```

Store:
- `issueNumber`: GitHub Issue number (e.g., #5)
- `issueUrl`: Full URL to the Issue
- `createdAt`: Timestamp of Issue creation

### 6. Verify Issue Creation

Validate the Issue was created correctly:

```bash
# Verify Issue exists and is open
gh issue view ${ISSUE_NUM} --json state,title,labels

# Expected output should show:
# - state: "OPEN"
# - title: "Story X.Y: ..."
# - labels: [{name: "type:feature"}, {name: "area:..."}, {name: "epic:..."}]
```

If verification fails, HALT and report error with Issue number.

### 7. Return Issue Details to Caller

Provide the following data back to the calling task (create-next-story.md):

```yaml
github_issue:
  number: 5
  url: "https://github.com/owner/repo/issues/5"
  title: "Story 1.2: Shoprite/PnP Ingestion"
  state: "OPEN"
  labels:
    - "type:feature"
    - "area:ingestion"
    - "epic:1"
  created_at: "2025-10-21T10:30:00Z"
```

This data will be used to:
1. Create the local markdown file with Issue reference
2. Provide confirmation to the user
3. Update the story template with GitHub Issue metadata

## Error Handling

**If gh CLI fails:**
- Check authentication: `gh auth status`
- Check network connectivity
- Verify repository permissions
- Provide clear error message to user with troubleshooting steps

**If Issue creation fails:**
- Log the error message from gh CLI
- Check if Issue body has formatting issues (special characters)
- Verify labels are valid (no spaces, lowercase with colons)
- HALT and inform user with actionable next steps

**If Issue number cannot be captured:**
- Manually check last created Issue: `gh issue list --limit 1`
- Ask user to verify Issue creation on GitHub web UI
- Provide Issue number manually if needed

## Success Criteria

- GitHub Issue created with correct title format: "Story X.Y: Title"
- Issue body matches CLAUDE.md template structure
- All labels applied correctly (type, area, epic)
- Issue is in OPEN state
- Issue number and URL captured and returned
- Issue is immediately viewable via `gh issue view {number}` and GitHub web UI

## Notes

- GitHub Issue numbers are sequential and global (#1, #2, #3...)
- Story numbers are epic-scoped (1.1, 1.2, 2.1, 2.2...)
- Both numbering systems are preserved via cross-referencing
- The Issue title includes story number for easy identification
- The epic label enables filtering Issues by epic
- The local markdown file will reference this Issue number for bidirectional linking
