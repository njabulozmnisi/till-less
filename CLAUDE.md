- You must follow **Git Flow** and **simulate Pull Requests (PRs)** before merging into `develop`.

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

## Simulated PR Workflow (for every `feature/*`, `bugfix/*`, `release/*`, `hotfix/*`)

Before merging a branch into `develop`, you must perform a **Simulated PR** stored in:

```
.simulated-prs/<branch-name>.md
```

### Simulated PR Steps

1. **Create the file** `.simulated-prs/<branch-name>.md`
2. **Fill it using the PR template** (included below)
3. **Generate and include**:
    - `git diff --stat` vs `develop`
    - Summary of changes
4. **Run quality checks**:
    - Lint
    - Typecheck
    - Automated tests (if any)
    - Basic secret scan
5. **Write a Self-Review** (nits, risks, follow-ups)
6. **Approve the Simulated PR** once checks pass ✅

---

## Merge Rules

- `feature/*` & `bugfix/*` → **squash-merge into `develop`**
- `release/*` → **squash-merge into `main`**, tag version, then back-merge `main` into `develop`
- `hotfix/*` → **squash-merge into `main`**, tag version, then back-merge `main` into `develop`

After a successful merge:
1. **Delete the branch**
2. **Switch back to `develop`**
3. Continue working on the next task

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
- Store it in `.simulated-prs/` for **archiving**
- Run all checks before merging
- **Squash-merge using correct flow rules**
- **Switch back to `develop` immediately after merging**
- Keep history clean, incremental, and traceable

---