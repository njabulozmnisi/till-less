# Testing Strategy

## Tooling
- **Unit Tests**: Vitest for TypeScript projects across workers, consumers, and backend modules. Fast, native ESM support, compatible with Jest API.
- **Integration Tests**: Prisma Test Environment with ephemeral Postgres (via docker-compose or Supabase test db) to validate queue consumer persistence.
- **Frontend UI**: React Testing Library + @testing-library/jest-dom for component/unit tests; Playwright for critical flows when needed.
- **Workflow Tests**: `@temporalio/testing` suite for Temporal workflows/activities, simulating retries and failure paths.
- **End-to-End Scripts**: Playwright for E2E testing; k6 or Artillery for load/perf validation of optimisation endpoints (see Ops stories).

## Conventions
- Place unit tests adjacent to code (`*.spec.ts` or `*.test.ts`). Shared fixtures live under `test/fixtures/`.
- Use `pnpm test` for all packages; CI pipeline should run `pnpm lint && pnpm test`.
- Mock external services (BetterAuth, Supabase) using dependency injection or test doubles; prefer integration tests for Prisma to catch schema drifts.
- Temporal workflow tests should cover happy path, retry exhaustion, and idempotency using the `TestWorkflowEnvironment` helper.
- Scraper workers should include parsing snapshot fixtures under `__fixtures__/` with deterministically generated `content_hash` values.

## Reporting
- Emit coverage reports per package (`coverage/` directories) aggregated via `pnpm coverage` script.
- Failed tests must surface logs in CI artifacts (Temporal logs, console outputs) for troubleshooting.

## Acceptance Mapping
- Each story must list key scenarios linking Acceptance Criteria to tests (unit/integration/workflow).
- QA sign-off requires evidence of: unit tests passing, integration tests covering data persistence, workflow logs, and manual validation notes.