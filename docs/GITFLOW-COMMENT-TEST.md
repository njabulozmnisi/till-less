# Git Flow Test - Simulated PR as Issue Comment

**Issue:** #2 (REAL GitHub Issue)
**Issue URL:** https://github.com/njabulozmnisi/till-less/issues/2
**Branch:** `feature/2-test-simulated-pr-comment`
**Date:** 2025-10-19
**Purpose:** Validate updated Git Flow with Simulated PR posted as Issue comment

---

## Test Objective

Validate the NEW Git Flow guidelines where:
- ✅ GitHub Issue is the single source of truth
- ✅ Simulated PR posted as **Issue comment** (not file)
- ❌ No `.simulated-prs/` folder created
- ❌ No sequential IDs (0001, 0002, etc.)
- ❌ No INDEX.md updates

**Key Change:** Simulated PR review is posted as a comment on the GitHub Issue instead of creating a file in the repository.

---

## Updated Workflow

### Old Workflow (Issue #1):
1. Create GitHub Issue
2. Create branch with Issue number
3. Make commits
4. **Create file:** `.simulated-prs/NNNN-<issue>-<slug>.md`
5. **Update INDEX.md** with sequential ID
6. Merge to develop
7. Close Issue

### New Workflow (Issue #2):
1. Create GitHub Issue ✅
2. Create branch with Issue number ✅
3. Make commits (in progress)
4. **Post Simulated PR as Issue comment** ⏳
5. Merge to develop ⏳
6. **Comment on Issue** with merge details ⏳
7. Close Issue ⏳

---

## Real GitHub Issue Details

```json
{
  "number": 2,
  "state": "OPEN",
  "title": "Test updated Git Flow with Simulated PR as Issue comment",
  "url": "https://github.com/njabulozmnisi/till-less/issues/2"
}
```

---

## Git Flow Steps

### Step 1: GitHub Issue Creation ✅
- Created via: `gh issue create`
- Issue #2: https://github.com/njabulozmnisi/till-less/issues/2
- Full template with all required sections

### Step 2: Branch Creation ✅
- Format: `feature/<issue>-<slug>`
- Actual: `feature/2-test-simulated-pr-comment`
- Issue #2 included in branch name

### Step 3: Conventional Commits (In Progress)
- Format: `type(2): description`
- All commits reference Issue #2

### Step 4: Simulated PR as Issue Comment (Pending)
- **NO file creation** in `.simulated-prs/`
- **Post comment** on Issue #2 using template
- Command: `gh issue comment 2 --body "<template>"`

### Step 5: Squash Merge (Pending)
- Target: `develop`
- Commit includes: `Closes #2`

### Step 6: Post-Merge Comment (Pending)
- Post comment on Issue #2 with merge commit SHA
- Example: "Merged to develop in commit [sha]"

### Step 7: Branch Preservation (Pending)
- Branch NOT deleted after merge

---

## Validation Checklist

**GitHub Integration:**
- ✅ Issue #2 created via gh CLI
- ✅ Issue viewable on GitHub
- ⏳ Simulated PR posted as Issue comment
- ⏳ Post-merge comment added to Issue
- ⏳ Issue closed via `Closes #2`

**No File Creation:**
- ⏳ Verify NO file in `.simulated-prs/` folder
- ⏳ Verify NO INDEX.md update
- ⏳ All Simulated PR content in Issue comments only

**Git Flow Compliance:**
- ✅ Issue created first
- ✅ Branch name includes Issue number
- ⏳ Commits use conventional format
- ⏳ Branch preserved after merge

---

## Benefits of Comment-Based Simulated PRs

**Issue Comment Approach:**
- ✅ Single source of truth (GitHub Issue)
- ✅ All workflow history in one place
- ✅ No repository file clutter
- ✅ No sequential ID management
- ✅ Easier to find (just look at Issue comments)
- ✅ GitHub's built-in comment threading and reactions

**Old File-Based Approach:**
- ⚠️ Separate files in `.simulated-prs/`
- ⚠️ Required INDEX.md maintenance
- ⚠️ Sequential ID management overhead
- ⚠️ Harder to correlate PR file with Issue

---

## Commands Used

```bash
# Create Issue
gh issue create --title "..." --body "..."

# Verify Issue
gh issue view 2 --json number,title,url,state

# Post Simulated PR as comment
gh issue comment 2 --body "$(cat <<'EOF'
### Simulated PR Review
...template content...
EOF
)"

# Close Issue (post-merge)
gh issue close 2 --comment "Merged to develop in commit [sha]"
```

---

**Status:** In Progress
**Last Updated:** 2025-10-19
**Issue Status:** OPEN

---

## Test Execution Log

**Commit 1:** feat(2): add Git Flow test for comment-based Simulated PRs
- SHA: b2fee23
- Created test documentation
- Verified Issue #2 is OPEN
- Branch: feature/2-test-simulated-pr-comment

**Next Steps:**
- Post Simulated PR as Issue comment (using gh issue comment)
- Run quality checks
- Squash-merge to develop
- Post-merge comment on Issue #2
