- # Permanent Guideline — Git Flow with **GitHub Issues First** (PR Review as Issue Comment)

This project is **Issue‑driven**. The AI agent must **create or update the GitHub Issue first**, capture all context in the Issue, then create a branch, commit incrementally, and post a **PR review as an Issue comment** before merging.

**CRITICAL:** If work was started without a GitHub Issue, the agent must **create one immediately** before proceeding to merge.

Branches are **not deleted** after merge. There is **no `.simulated-prs/` folder** and **no sequential IDs** — the GitHub Issue is the single source of truth.

---

## High‑Level Flow

1) **Issue First** → 2) **Branch** → 3) **Commits** → 4) **Issue Gate & PR Review (Issue comment)** → 5) **Merge** → 6) **Post‑merge updates**

---

## 1) Issue‑First Rules (Agent must do these before branching)

When starting any task, the agent must **create a GitHub Issue** (or update an existing one) with:

### Title
A concise, outcome‑oriented title, e.g. `Add CSV export for customers`

### Labels
- `type: feature | bug | chore | refactor | docs | perf | test | ci | build`
- `area: <domain/module>` (optional)
- Priority label if needed (`P1`, `P2`, ...)
- Project/Milestone linkage if used

### Issue Description Template
```md
## Context
- Background and problem framing

## Goals
- What success looks like (bullet points)

## Non-Goals
- Explicitly out-of-scope items

## Acceptance Criteria (Given/When/Then)
- Given ..., When ..., Then ...
- Given ..., When ..., Then ...

## Approach Sketch
- High-level implementation plan
- Data model / API changes (if any)
- Observability (logs, metrics, alerts)

## Risks & Mitigations
- Security, privacy, performance, data migrations, rollbacks

## Test Plan
- Unit / integration / manual checks

## Dependencies
- External services, feature flags, secrets, env vars

## Assets & Links
- Designs, docs, related issues

## Estimate & Target
- T-shirt size (S/M/L/XL) and/or time estimate
- Target release / milestone
```

Record the **Issue number** (e.g., `#123`).

---

## 2) Branch Naming (Git Flow + Issue IDs)

Primary branches:
- `main` — stable production
- `develop` — integration

Working branches (must include the Issue number):
- `feature/<issue>-<slug>` → `feature/123-add-csv-export`
- `bugfix/<issue>-<slug>` → `bugfix/456-fix-token-refresh`
- `hotfix/<issue>-<slug>` → `hotfix/789-fix-prod-crash`
- `release/<version>` → `release/1.4.0`

> **Note:** Branches are **not deleted** after merge.

---

## 3) Commit Rules (Conventional + Issue reference)

- Commit **small and often**, with clear “why”
- Use Conventional Commits referencing the Issue, e.g.:
  ```
  feat(123): add CSV export
  fix(456): handle token refresh on 401
  refactor(123): extract CSV writer
  ```
- Include an auto‑close line at least once (usually in the squash message):
  ```
  Closes #123
  ```
> Auto‑close triggers when merging into the default branch (`main`). If merging into `develop`, close the Issue manually at release time or when appropriate.

---

## 4) Issue-First Gate: Create Issue if None Exists, Then Post PR Review

**CRITICAL: If no GitHub Issue exists for the work being done, create one FIRST before proceeding.**

### Step 4a: Verify or Create GitHub Issue

Before merging, ensure a GitHub Issue exists for the work:

**If Issue exists:** Proceed to Step 4b (post PR review comment)

**If NO Issue exists:**
1. **STOP immediately** - do not merge without an Issue
2. **Create GitHub Issue** using the Issue template (see Section 1):
   ```bash
   gh issue create \
     --title "{Descriptive title for work done}" \
     --body "$(cat <<'EOF'
   ## Context
   [Describe what was implemented and why]

   ## Goals
   - [What this work achieves]

   ## Acceptance Criteria
   - [How to verify the work is complete]

   ## Test Plan
   - [Tests run and validation performed]
   EOF
   )" \
     --label "type:{feature|bug|chore}" \
     --label "area:{module}"
   ```
3. **Capture Issue number** (e.g., #123)
4. **Update branch name** if needed: `git branch -m feature/{issue}-{slug}`
5. **Amend commits** to reference Issue: `feat({issue}): ...` or add `Relates to #{issue}` in commit messages
6. Now proceed to Step 4b

### Step 4b: Post PR Review as Issue Comment

Once the GitHub Issue exists, the agent must **post a PR review as a comment on the Issue** using this template:

```md
### PR Review

**Branch**
`feature/<issue>-<slug>`

**Diff Stat**
```
<insert `git diff --stat origin/develop...HEAD`>
```

**Change Summary**
- High-level bullets of what changed

**Risks & Impact**
- Security implications?
- Performance impacts?
- Data migrations required?
- User-visible changes?

**Test Plan**
- Automated tests run: [specify which tests]
- Manual verification: [steps performed]

**Quality Checks**
- [ ] Lint clean
- [ ] Typecheck clean
- [ ] Tests pass
- [ ] Secrets scan clean

**Self-Review Notes**
- Nits: [minor issues or cleanup needed]
- Risks: [potential concerns]
- Follow-ups: [future work or tech debt]
```

> **Approval Gate:** The PR review comment serves as the approval gate. Only proceed to merge if:
> - All quality checks are ✅
> - Self-review looks sound
> - No critical risks identified
> - A GitHub Issue exists and is referenced

---

## 5) Merge Rules (Git Flow)

| Branch Type | Merge Into | After Merge |
|------------|------------|-------------|
| `feature/*` | `develop` | checkout `develop` → pull `develop` → push (if safe) |
| `bugfix/*` | `develop` | checkout `develop` → pull `develop` → push (if safe) |
| `release/*` | `main` | tag `vX.Y.Z` → back‑merge `main` → `develop` |
| `hotfix/*` | `main` | tag → back‑merge `main` → `develop` |

**Safe Push Gate** — Push only if BOTH are true:  
1) the merge succeeded (exit code 0), and  
2) the current branch is `develop`.

> Branches remain available for traceability; do **not** delete them.

---

## 6) Post‑Merge Updates (Agent responsibilities)

- **Issue updates**
  - If merged to default branch (`main`), ensure the Issue is **closed** (via `Closes #<issue>` or manually)
  - If merged to `develop`, **comment** with the merge commit link and keep the Issue open until release (or close when appropriate)
  - Move the Issue in **Project** or **Milestone**

- **Repository updates**
  - `git checkout develop`
  - `git pull origin develop`
  - If safe, `git push origin develop`

- **Documentation**
  - If you maintain release notes, add the Issue and summary under the relevant version

---

## Behavior Summary (agent must always)

- **Create or update the GitHub Issue first** with full context (NEVER start work without an Issue)
- **Verify Issue exists before merging** - if no Issue exists, create one immediately
- Use the **Issue number in branch names and commits**
- Post a **PR review as an Issue comment** before merge (no repo files)
- Follow **Git Flow** for merges
- After merge, **checkout `develop`**, **pull `develop`**, and **push only if safe**
- **Do not delete branches** after merge
- Keep work small, clear, and traceable