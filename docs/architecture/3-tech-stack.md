# 3. Tech Stack

## 3.1 Exact Version Lock (Updated: 2025-10-23)

**CRITICAL:** These are the exact versions to use for Story 1.1 (Nx monorepo setup). Do NOT use ranges (^, ~) in package.json.

### Core Frameworks

| Category | Technology | Exact Version | Lock Reason |
|----------|-----------|---------------|-------------|
| **Monorepo** | Nx | `19.8.2` | Latest stable as of 2025-10-23, proven nx/next + nx/nest compatibility |
| **Package Manager** | pnpm | `9.12.1` | Fastest, space-efficient, supports Nx workspaces |
| **Node Runtime** | Node.js | `20.18.0` LTS | Active LTS until 2026-04-30, Railway compatible |
| **TypeScript** | TypeScript | `5.6.3` | Latest stable, required for Next.js 15 + NestJS 10 |

### Frontend Stack

| Technology | Exact Version | Notes |
|-----------|---------------|-------|
| **Next.js** | `15.0.3` | Latest App Router, React 19 RC support, Server Components stable |
| **React** | `19.0.0-rc.1` | Required for Next.js 15, production-ready RC |
| **React DOM** | `19.0.0-rc.1` | Matches React version |
| **Tailwind CSS** | `4.0.0-beta.3` | OKLCH color support, container queries, CSS-first config |
| **Shadcn UI** | `latest` | Copy-paste approach (not npm package), use CLI v2.1.0 |
| **TanStack Query** | `5.59.16` | React 19 compatible, Server Components support |
| **Zustand** | `5.0.0` | Client-side state, React 19 compatible |
| **Zod** | `3.23.8` | Runtime validation, tRPC integration |

### Backend Stack

| Technology | Exact Version | Notes |
|-----------|---------------|-------|
| **NestJS Core** | `10.4.4` | Latest stable, tRPC integration tested |
| **NestJS Platform Express** | `10.4.4` | HTTP adapter |
| **tRPC Server** | `10.45.2` | Type-safe RPC, Zod integration |
| **Prisma Client** | `5.21.1` | ORM with full TypeScript types |
| **Prisma CLI** | `5.21.1` | Must match client version exactly |

### Database & Cache

| Technology | Exact Version | Provider | Free Tier Limits |
|-----------|---------------|----------|------------------|
| **PostgreSQL** | `15.8` | Supabase | 500MB database, 1GB storage, 2GB bandwidth |
| **Redis** | `7.4.1` | Upstash | 10K commands/day, 256MB storage |
| **Supabase Auth** | `2.65.0` | Supabase JS SDK | Unlimited auth users |

### External APIs

| Service | SDK/Client Version | API Version | Cost |
|---------|-------------------|-------------|------|
| **Google Cloud Vision** | `@google-cloud/vision@4.3.2` | v1 | 1000 requests/month free, then $1.50/1000 |
| **Twitter API v2** | `twitter-api-v2@1.17.2` | v2 Free Tier | 500K tweets/month |
| **Instagram Graph API** | `axios@1.7.7` (direct HTTP) | v21.0 | 200 requests/hour |

### Testing Stack

| Technology | Exact Version | Purpose |
|-----------|---------------|---------|
| **Vitest** | `2.1.2` | Unit tests, faster than Jest, ESM native |
| **Playwright** | `1.48.2` | E2E tests, cross-browser |
| **Testcontainers** | `10.13.2` | Integration tests with real Postgres |
| **Testing Library React** | `16.0.1` | Component testing, React 19 compatible |

### Developer Tools

| Technology | Exact Version | Purpose |
|-----------|---------------|---------|
| **ESLint** | `9.13.0` | Linting, flat config format |
| **Prettier** | `3.3.3` | Code formatting |
| **Husky** | `9.1.6` | Git hooks |
| **lint-staged** | `15.2.10` | Pre-commit formatting |
| **@nx/eslint** | `19.8.2` | Nx ESLint plugin |

### Monitoring & Observability

| Service | SDK Version | Free Tier |
|---------|-------------|-----------|
| **Sentry** | `@sentry/nextjs@8.34.0`, `@sentry/node@8.34.0` | 5K errors/month |
| **PostHog** | `posthog-js@1.165.0` | 1M events/month |
| **BetterUptime** | N/A (HTTP monitoring) | 1 monitor free |

## 3.2 Version Update Policy

**When to Update:**
- **Security patches:** Update immediately (e.g., 5.21.1 → 5.21.2)
- **Minor versions:** Review changelog, update quarterly (e.g., 5.21.x → 5.22.x)
- **Major versions:** Plan migration, update annually (e.g., 5.x → 6.x)

**How to Update:**
1. Create branch `chore/update-dependencies`
2. Run `pnpm update --interactive` to see available updates
3. Update one dependency at a time, run full test suite
4. Document breaking changes in PR description
5. Merge only after all tests pass

**Automated Updates:**
- Use Renovate Bot for automated dependency PRs
- Configure to group minor/patch updates weekly
- Require manual approval for major version bumps

## 3.3 Package.json Lock Configuration

**Root package.json should specify exact versions:**

```json
{
  "packageManager": "pnpm@9.12.1",
  "engines": {
    "node": "20.18.0",
    "pnpm": "9.12.1"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "19.0.0-rc.1",
    "react-dom": "19.0.0-rc.1"
  },
  "devDependencies": {
    "@nx/workspace": "19.8.2",
    "typescript": "5.6.3",
    "prettier": "3.3.3"
  }
}
```

**Use pnpm's lockfile for reproducibility:**
- Commit `pnpm-lock.yaml` to git
- CI/CD uses `pnpm install --frozen-lockfile` (fails if lock is outdated)
- Never use `pnpm install --no-lockfile`

---