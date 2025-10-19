# Mock Issue #999: Test new Git Flow guidelines compliance

**Status:** ✅ Closed
**Labels:** `type: test`, `area: workflow`
**Created:** 2025-10-19
**Closed:** 2025-10-19
**Merged Commit:** fdf66a3

---

## Context
Validate the new Issue-First Git Flow guidelines by executing a complete workflow test. This ensures the AI agent correctly follows all steps: Issue creation, branch naming with Issue ID, conventional commits, Simulated PR with sequential numbering, and post-merge rituals.

## Goals
- Verify GitHub Issue creation works correctly
- Confirm branch naming includes Issue number
- Test conventional commit format with Issue references
- Validate Simulated PR sequential ID system (next ID: 0008)
- Ensure post-merge rituals execute properly
- Document the test execution for future reference

## Non-Goals
- Production feature implementation
- Extensive code changes
- Performance optimization

## Acceptance Criteria
- Given the new Git Flow guidelines, When the agent executes a complete workflow, Then all steps follow the documented process
- Given a test branch, When commits are made, Then they use conventional format with Issue number
- Given the Simulated PR, When created, Then it uses sequential ID 0008 and includes Issue reference
- Given a successful merge, When post-merge runs, Then Issue is updated and branch is preserved

## Approach Sketch
1. Create this Issue (✓ completed as mock)
2. Create branch `feature/999-test-gitflow-compliance`
3. Add test documentation file `docs/GITFLOW-TEST.md`
4. Make 2-3 small commits with conventional format
5. Create `.simulated-prs/0008-999-test-gitflow-compliance.md`
6. Run quality checks (lint, typecheck, tests)
7. Squash-merge to develop with `Closes #999`
8. Post-merge: update Issue, push develop, update INDEX.md
9. Verify branch is NOT deleted

## Risks & Mitigations
- **Risk**: gh CLI not authenticated → **Mitigation**: Using mock Issue for test
- **Risk**: Sequential ID collision → **Mitigation**: Scan existing files first
- **Risk**: Merge conflicts → **Mitigation**: Simple test file, low conflict risk

## Test Plan
Manual verification:
1. Check Issue is created with full template ✓
2. Verify branch name includes Issue number
3. Confirm commits use `feat(999):` format
4. Validate Simulated PR has correct sequential ID
5. Ensure branch exists after merge
6. Verify Issue is closed/updated after merge

## Dependencies
- Git configured with user identity
- Access to push branches

## Assets & Links
- Git Flow Guidelines: `/CLAUDE.md`
- Simulated PR Archive: `/.simulated-prs/`
- INDEX: `/.simulated-prs/INDEX.md`

## Estimate & Target
- Size: **S** (Small)
- Estimate: 10-15 minutes
- Target: Immediate (validation task)

---

**Note:** This is a mock Issue created in `.github/MOCK-ISSUES/` since `gh` CLI is unavailable. In production, this would be a real GitHub Issue.
