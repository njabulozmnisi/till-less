- # Permanent Guideline — Git Flow with Archived Simulated PRs (with Sequential IDs)

You must follow **Git Flow** and **simulate Pull Requests (PRs)** before merging into `develop`. Each simulated PR is archived as a Markdown file and **prefixed with a 4‑digit sequential ID**.

---

## Branching Rules

Primary branches:
- `main` — stable production branch
- `develop` — integration branch

Working branches:
- `feature/<slug>` — new features
- `bugfix/<slug>` — non-critical fixes
- `hotfix/<slug>` — urgent production fixes (merge into `main`, then back-merge into `develop`)
- `release/<version>` — final preparation before shipping to `main`

---

## Commit Rules

- Commit **small and often**
- Use **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `build:`, `ci:`)
- Write commit messages that state **why**, not only what

---

## Simulated PR Archive & Naming (Sequential IDs)

- Archive folder: `.simulated-prs/`
- **File name format (4-digit padded):**  
  `NNNN-<branch-name>.md`  
  Examples:  
  `.simulated-prs/0001-feature-add-login.md`  
  `.simulated-prs/0002-bugfix-session-timeout.md`

**Numbering rules:**
1. Use **4-digit, zero-padded** IDs (`0001`, `0002`, … `9999`).
2. **Never reuse** IDs; each new simulated PR gets the **next number**.
3. Determine `NNNN` by scanning existing files in `.simulated-prs/` and selecting **max + 1**.
4. If `.simulated-prs/` does not exist, **start at `0001`**.
5. The number is assigned when you **open** the simulated PR (file creation time), not at merge time.

*(Optional but recommended)* Maintain an index file `.simulated-prs/INDEX.md` listing `NNNN`, title, branch, and date for quick lookup.

---

## Simulated PR Workflow (for every `feature/*`, `bugfix/*`, `release/*`, `hotfix/*`)

Before merging a branch into `develop`, you must perform a **Simulated PR** stored in:

```
.simulated-prs/NNNN-<branch-name>.md
```

### Simulated PR Steps

1. **Allocate next ID & create file** `.simulated-prs/NNNN-<branch-name>.md`  
   - Choose `NNNN` per the numbering rules above.
2. **Fill it using the PR template** (below).
3. **Generate and include**:
   - `git diff --stat` vs `develop`
   - Summary of changes
4. **Run quality checks**:
   - Lint
   - Typecheck
   - Automated tests (if any)
   - Basic secret scan
5. **Write a Self-Review** (nits, risks, follow-ups).
6. **Approve the Simulated PR** once checks pass ✅.

---

## Merge Rules

- `feature/*` & `bugfix/*` → **squash-merge into `develop`**
- `release/*` → **squash-merge into `main`**, tag version, then back-merge `main` into `develop`
- `hotfix/*` → **squash-merge into `main`**, tag version, then back-merge `main` into `develop`

---

## Post‑Merge Ritual (all branches)

1. **Delete the task branch** that was merged.
2. **Switch back to `develop`** (`git checkout develop`).
3. **Safe Push Gate (push only if BOTH are true):**
   - The merge **succeeded** (no conflicts, exit code 0).
   - You are **currently on `develop`**.
4. **If both criteria are met, push `develop`**: `git push origin develop`.
5. Update `.simulated-prs/INDEX.md` (if you keep one) with `NNNN`, title, and date.
6. Continue with the next task.

> Rationale: This prevents accidental pushes from the wrong branch or after a failed/partial merge and preserves an auditable trail of simulated PRs.

---

## Simulated PR Template

```md
# Simulated PR — <type(scope): short summary>

## Context / Why
- Problem or goal

## Change Summary
- High-level bullet list of changes

## Diff Stat
```
<insert `git diff --stat origin/develop...HEAD`>
```

## Risks & Impact
- Security?
- Performance?
- Data migrations?
- User-visible changes?

## Test Plan
- Automated tests
- Manual steps

## Checks
- [ ] Lint clean
- [ ] Typecheck clean
- [ ] Tests pass
- [ ] Secret scan clean

## Self-Review Notes
**Nits**
- …

**Risks**
- …

**Follow-ups**
- …
```

---

## Behavior Summary

Claude must always:

- Follow **Git Flow**
- Create a **new simulated PR file per branch**
- **Prefix the file name with a 4‑digit sequential ID** and store it in `.simulated-prs/`
- Run all checks before merging
- **Squash-merge using correct flow rules**
- **After merge: delete branch → checkout `develop` → only then push `develop` if both criteria are met**
- Keep history clean, incremental, and traceable

---