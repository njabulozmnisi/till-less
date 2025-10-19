# Real GitHub Issue Integration Test

**Issue:** #1 (REAL GitHub Issue)
**Issue URL:** https://github.com/njabulozmnisi/till-less/issues/1
**Branch:** `feature/1-validate-real-github-integration`
**Date:** 2025-10-19
**Purpose:** Validate Git Flow with real GitHub Issue integration (no mocking)

---

## Test Objective

This document validates that the AI agent correctly integrates with GitHub's Issue tracking system when following the new Git Flow guidelines.

**Key Difference from Previous Test:**
- Previous test (#999): Used mock Issue in `.github/MOCK-ISSUES/`
- This test (#1): Uses REAL GitHub Issue created via `gh` CLI

---

## Real GitHub Issue Details

```json
{
  "number": 1,
  "state": "OPEN",
  "title": "Validate Git Flow with real GitHub Issue integration",
  "url": "https://github.com/njabulozmnisi/till-less/issues/1"
}
```

**Issue Created:** Via `gh issue create` command
**Authentication:** gh CLI authenticated as njabulozmnisi
**Repository:** njabulozmnisi/till-less

---

## Git Flow Steps Validated

### Step 1: Real GitHub Issue Creation ✅
- Used: `gh issue create --title "..." --body "..."`
- Result: Issue #1 created successfully
- Template: Full Issue template with all required sections
- Verification: `gh issue view 1` confirms OPEN state

### Step 2: Branch Creation with Real Issue Number ✅
- Format: `feature/<issue>-<slug>`
- Actual: `feature/1-validate-real-github-integration`
- Issue number included: ✅ (#1)

### Step 3: Conventional Commits (In Progress)
- Format: `type(1): description`
- Expected commits:
  - `feat(1): add real GitHub issue integration test`
  - `docs(1): document real issue workflow`
  - `docs(1): create simulated PR for issue #1`

### Step 4: Simulated PR
- Next sequential ID: 0009
- Expected filename: `.simulated-prs/0009-1-validate-real-github-integration.md`
- Must include: Real Issue link, `Closes #1` reference

### Step 5: Quality Checks
- Secret scan: Verify no credentials exposed
- Format check: Run `pnpm format:check`
- Documentation only: No typecheck/tests needed

### Step 6: Squash Merge
- Target: `develop` branch
- Commit message: Must include `Closes #1`
- Method: `git merge --squash`

### Step 7: Post-Merge Ritual with Real Issue
- Use `gh issue close 1 --comment "..."` to close Issue
- Or verify auto-close if merged to default branch
- Update `.simulated-prs/INDEX.md` with PR #0009
- Push to `origin/develop`

### Step 8: Branch Preservation
- Branch `feature/1-validate-real-github-integration` must NOT be deleted
- Verify with `git branch -a` after merge

---

## Validation Checklist

**Real GitHub Integration:**
- ✅ Issue #1 created via GitHub API (not mock)
- ✅ Issue number retrieved from `gh` CLI output
- ✅ Issue viewable on GitHub: https://github.com/njabulozmnisi/till-less/issues/1
- ⏳ Issue referenced in all commits
- ⏳ Issue closed via `gh issue close` after merge
- ⏳ Issue timeline shows merge reference

**Git Flow Compliance:**
- ✅ Issue created first (before any coding)
- ✅ Branch name includes Issue number
- ⏳ Commits use conventional format with Issue reference
- ⏳ Simulated PR uses sequential ID 0009
- ⏳ Squash commit includes `Closes #1`
- ⏳ Branch preserved after merge

---

## Expected Outcomes

✅ **Success Criteria:**
1. Real GitHub Issue #1 created and viewable on GitHub
2. Branch name: `feature/1-validate-real-github-integration`
3. All commits use `type(1):` format
4. Simulated PR filename: `0009-1-validate-real-github-integration.md`
5. Issue #1 closed via `gh issue close` after merge
6. Branch preserved (NOT deleted)
7. INDEX.md updated with PR #0009

❌ **Failure Criteria:**
- Issue not created on GitHub
- Mock Issue used instead of real Issue
- Wrong Issue number in branch/commits
- Issue not closed after merge
- Branch deleted (should be preserved)

---

## Advantages of Real Issue vs Mock

**Real GitHub Issue:**
- ✅ Tests actual API integration
- ✅ Verifies authentication and permissions
- ✅ Tests auto-close behavior with `Closes #<issue>`
- ✅ Creates audit trail on GitHub
- ✅ Validates `gh` CLI workflow
- ✅ Issue visible to all repository collaborators

**Mock Issue:**
- ⚠️ Only tests Git Flow mechanics
- ⚠️ No API integration validation
- ⚠️ No auto-close testing
- ⚠️ Local file only, not shared

---

## Commands Used

```bash
# Create real Issue
gh issue create --title "..." --body "..."

# Verify Issue
gh issue view 1 --json number,title,url,state

# Close Issue (post-merge)
gh issue close 1 --comment "Merged via commit [sha]"

# Add comment to Issue
gh issue comment 1 --body "Merged to develop in PR #0009"
```

---

**Status:** In Progress
**Last Updated:** 2025-10-19
**Issue Status:** OPEN (will close after merge)

---

## Test Execution Log

**Commit 1:** feat(1): add real GitHub Issue integration test documentation
- SHA: 298aa8a
- Added full test documentation
- Verified Issue #1 exists and is OPEN
- Branch created: feature/1-validate-real-github-integration

**Next Steps:**
- Create Simulated PR document (ID 0009)
- Run quality checks
- Squash-merge to develop
- Close Issue #1 via gh CLI
