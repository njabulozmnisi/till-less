<!-- Powered by BMAD™ Core -->

# Create Next Story Task

## Purpose

To identify the next logical story based on project progress and epic definitions, and then to prepare a comprehensive, self-contained, and actionable story file using the `Story Template`. This task ensures the story is enriched with all necessary technical context, requirements, and acceptance criteria, making it ready for efficient implementation by a Developer Agent with minimal need for additional research or finding its own context.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Core Configuration and Check Workflow

- Load `.bmad-core/core-config.yaml` from the project root
- If the file does not exist, HALT and inform the user: "core-config.yaml not found. This file is required for story creation. You can either: 1) Copy it from GITHUB bmad-core/core-config.yaml and configure it for your project OR 2) Run the BMad installer against your project to upgrade and add the file automatically. Please add and configure core-config.yaml before proceeding."
- Extract key configurations: `devStoryLocation`, `prd.*`, `architecture.*`, `workflow.*`

### 1. Identify Next Story for Preparation

#### 1.1 Locate Epic Files and Review Existing Stories

- Based on `prdSharded` from config, locate epic files (sharded location/pattern or monolithic PRD sections)
- If `devStoryLocation` has story files, load the highest `{epicNum}.{storyNum}.story.md` file
- **If highest story exists:**
  - Verify status is 'Done'. If not, alert user: "ALERT: Found incomplete story! File: {lastEpicNum}.{lastStoryNum}.story.md Status: [current status] You should fix this story first, but would you like to accept risk & override to create the next story in draft?"
  - If proceeding, select next sequential story in the current epic
  - If epic is complete, prompt user: "Epic {epicNum} Complete: All stories in Epic {epicNum} have been completed. Would you like to: 1) Begin Epic {epicNum + 1} with story 1 2) Select a specific story to work on 3) Cancel story creation"
  - **CRITICAL**: NEVER automatically skip to another epic. User MUST explicitly instruct which story to create.
- **If no story files exist:** The next story is ALWAYS 1.1 (first story of first epic)
- Announce the identified story to the user: "Identified next story for preparation: {epicNum}.{storyNum} - {Story Title}"

### 2. Gather Story Requirements and Previous Story Context

- Extract story requirements from the identified epic file
- If previous story exists, review Dev Agent Record sections for:
  - Completion Notes and Debug Log References
  - Implementation deviations and technical decisions
  - Challenges encountered and lessons learned
- Extract relevant insights that inform the current story's preparation

### 3. Gather Architecture Context

#### 3.1 Determine Architecture Reading Strategy

- **If `architectureVersion: >= v4` and `architectureSharded: true`**: Read `{architectureShardedLocation}/index.md` then follow structured reading order below
- **Else**: Use monolithic `architectureFile` for similar sections

#### 3.2 Read Architecture Documents Based on Story Type

**For ALL Stories:** tech-stack.md, unified-project-structure.md, coding-standards.md, testing-strategy.md

**For Backend/API Stories, additionally:** data-models.md, database-schema.md, backend-architecture.md, rest-api-spec.md, external-apis.md

**For Frontend/UI Stories, additionally:** frontend-architecture.md, components.md, core-workflows.md, data-models.md

**For Full-Stack Stories:** Read both Backend and Frontend sections above

#### 3.3 Extract Story-Specific Technical Details

Extract ONLY information directly relevant to implementing the current story. Do NOT invent new libraries, patterns, or standards not in the source documents.

Extract:

- Specific data models, schemas, or structures the story will use
- API endpoints the story must implement or consume
- Component specifications for UI elements in the story
- File paths and naming conventions for new code
- Testing requirements specific to the story's features
- Security or performance considerations affecting the story

ALWAYS cite source documents: `[Source: architecture/{filename}.md#{section}]`

### 4. Verify Project Structure Alignment

- Cross-reference story requirements with Project Structure Guide from `docs/architecture/unified-project-structure.md`
- Ensure file paths, component locations, or module names align with defined structures
- Document any structural conflicts in "Project Structure Notes" section within the story draft

### 5. Create GitHub Issue FIRST (Primary Source of Truth)

**CRITICAL: GitHub Issue must be created BEFORE local markdown file**

- Execute task: `.bmad-core/tasks/create-github-issue-from-story.md`
- Provide the following data to the task:
  - `epicNum`, `storyNum`, `storyTitle` (from Step 1)
  - `context`: Background from epic and previous story insights
  - `goals`: Story objectives extracted from epic
  - `nonGoals`: Out-of-scope items
  - `acceptanceCriteria`: ACs from epic in Given/When/Then format
  - `approachSketch`: High-level tasks and implementation approach
  - `risksAndMitigations`: Security, performance, migration risks identified
  - `testPlan`: Testing requirements from architecture/testing-strategy.md
  - `dependencies`: External services, previous stories, infrastructure needs
  - `assetsAndLinks`: Epic reference, architecture docs
  - `sizeEstimate`: T-shirt size (S/M/L/XL) based on complexity
  - `moduleArea`: Domain/module (ingestion, backend, frontend, etc.)
- Capture returned data:
  - `issueNumber`: GitHub Issue number (e.g., #5)
  - `issueUrl`: Full URL to the GitHub Issue
  - `createdAt`: Timestamp
  - `labels`: Applied labels
- **VERIFICATION**: Confirm Issue was created successfully via `gh issue view {issueNumber}`
- If Issue creation fails, HALT and troubleshoot before proceeding to local file creation

### 6. Create Local Markdown File (with GitHub Issue Reference)

- Create new story file: `{devStoryLocation}/{epicNum}.{storyNum}.{story_slug}.md` using Story Template
- **CRITICAL: Add GitHub Issue reference at the very top:**
  ```markdown
  # Story {epicNum}.{storyNum}: {storyTitle}

  **GitHub Issue:** #{issueNumber}
  **Issue URL:** {issueUrl}
  **Status:** Draft

  ---
  ```
- Fill in story sections mirroring GitHub Issue content:
  - Story statement (As a... I want... so that...)
  - Acceptance Criteria (same as in GitHub Issue)
  - Tasks / Subtasks (detailed breakdown from Approach Sketch)
- **`Dev Notes` section (CRITICAL):**
  - CRITICAL: This section MUST contain ONLY information extracted from architecture documents. NEVER invent or assume technical details.
  - Include ALL relevant technical details from Steps 2-3, organized by category:
    - **Previous Story Insights**: Key learnings from previous story
    - **Data Models**: Specific schemas, validation rules, relationships [with source references]
    - **API Specifications**: Endpoint details, request/response formats, auth requirements [with source references]
    - **Component Specifications**: UI component details, props, state management [with source references]
    - **File Locations**: Exact paths where new code should be created based on project structure
    - **Testing Requirements**: Specific test cases or strategies from testing-strategy.md
    - **Technical Constraints**: Version requirements, performance considerations, security rules
  - Every technical detail MUST include its source reference: `[Source: architecture/{filename}.md#{section}]`
  - If information for a category is not found in the architecture docs, explicitly state: "No specific guidance found in architecture docs"
- **`Tasks / Subtasks` section:**
  - Generate detailed, sequential list of technical tasks based ONLY on: Epic Requirements, Story AC, Reviewed Architecture Information
  - Each task must reference relevant architecture documentation
  - Include unit testing as explicit subtasks based on the Testing Strategy
  - Link tasks to ACs where applicable (e.g., `Task 1 (AC: 1, 3)`)
- Add notes on project structure alignment or discrepancies found in Step 4
- **Add footer note:**
  ```markdown
  ---

  **Note:** This is a local reference file for development.
  [GitHub Issue #{issueNumber}]({issueUrl}) is the authoritative source of truth for workflow tracking and team collaboration.
  ```

### 7. Cross-Reference Validation

**Ensure bidirectional linking between GitHub Issue and local markdown:**

- Verify GitHub Issue title contains story number: `Story {epicNum}.{storyNum}: ...`
- Verify markdown filename contains story number: `{epicNum}.{storyNum}.{slug}.md`
- Verify markdown file header references GitHub Issue number: `**GitHub Issue:** #{issueNumber}`
- **Update GitHub Issue with local file reference:**
  - Add comment to Issue: `Local story documentation: docs/stories/{epicNum}.{storyNum}.{slug}.md`
  - Or edit Issue body to include under "Assets & Links" section
- Confirm both sources have same Acceptance Criteria and Goals

### 8. Story Draft Completion and Review

- Review all sections for completeness and accuracy
- Verify all source references are included for technical details
- Ensure tasks align with both epic requirements and architecture constraints
- Verify GitHub Issue and local markdown are synchronized
- Update status to "Draft" in both GitHub Issue (via comment) and local markdown
- Execute `.bmad-core/tasks/execute-checklist` `.bmad-core/checklists/story-draft-checklist`
- Provide summary to user including:
  - **GitHub Issue Created:** #{issueNumber} - {issueUrl}
  - **Local Story File Created:** `{devStoryLocation}/{epicNum}.{storyNum}.{slug}.md`
  - Status: Draft
  - Labels Applied: {labels}
  - Key technical components included from architecture docs
  - Any deviations or conflicts noted between epic and architecture
  - Checklist Results
  - Next steps:
    - Review GitHub Issue for completeness: `gh issue view {issueNumber}`
    - Review local markdown file for technical details
    - For complex stories, optionally have PO run `.bmad-core/tasks/validate-next-story`
    - When ready to implement, developer will use: `git checkout -b feature/{issueNumber}-{slug}`
