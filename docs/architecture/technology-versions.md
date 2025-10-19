# Technology Versions - TillLess Phase 1

**Last Updated:** 2025-01-19
**Review Cycle:** Monthly
**Security Update Policy:** Critical CVEs within 24h, High within 7 days

---

## Runtime Environments

| Component | Version | LTS Until | Notes |
|-----------|---------|-----------|-------|
| Node.js | **20.11.1** | 2026-04-30 | LTS (Iron), required for all apps |
| pnpm | **9.14.2** | - | Workspace support, lockfile v9 |
| Docker | **27.4.0** | - | Required for Temporalite orchestration |
| Docker Compose | **2.31.0** | - | Local development environment |

**Installation verification:**
```bash
node --version    # v20.11.1
pnpm --version    # 9.14.2
docker --version  # Docker version 27.4.0
```

---

## Frontend Stack (apps/web)

### Core Framework

| Package | Version | Notes |
|---------|---------|-------|
| **next** | **15.1.3** | App Router, React Server Components, Turbopack |
| **react** | **18.3.1** | Required by Next.js 15 |
| **react-dom** | **18.3.1** | Required by Next.js 15 |
| **typescript** | **5.7.2** | Strict mode enabled, moduleResolution: bundler |

### State Management & Data Fetching

| Package | Version | Notes |
|---------|---------|-------|
| **@reduxjs/toolkit** | **2.5.0** | Includes RTK Query 2.5.0 |
| **react-redux** | **9.1.2** | React 18 compatible, hooks API |

### Authentication

| Package | Version | Notes |
|---------|---------|-------|
| **better-auth** | **1.0.7** | Open-source auth, JWT + refresh tokens |
| **@better-auth/react** | **1.0.7** | React hooks for authentication |

### UI & Styling

| Package | Version | Notes |
|---------|---------|-------|
| **tailwindcss** | **4.1.0** | Complete rewrite, CSS-first config, built-in PostCSS |
| **@tailwindcss/forms** | **0.5.9** | Form element styling |
| **@tailwindcss/typography** | **0.5.15** | Prose styling |

### Radix UI (shadcn/ui base)

| Package | Version | Notes |
|---------|---------|-------|
| **@radix-ui/react-accordion** | **1.2.2** | Accordion component |
| **@radix-ui/react-alert-dialog** | **1.1.4** | Alert dialog |
| **@radix-ui/react-dialog** | **1.1.4** | Modal dialog |
| **@radix-ui/react-dropdown-menu** | **2.1.4** | Dropdown menu |
| **@radix-ui/react-label** | **2.1.1** | Form labels |
| **@radix-ui/react-select** | **2.1.4** | Select component |
| **@radix-ui/react-separator** | **1.1.1** | Separator |
| **@radix-ui/react-slot** | **1.1.1** | Composition primitive |
| **@radix-ui/react-switch** | **1.1.2** | Toggle switch |
| **@radix-ui/react-tabs** | **1.1.2** | Tabs component |
| **@radix-ui/react-toast** | **1.2.4** | Toast notifications |

### Icons & Animation

| Package | Version | Notes |
|---------|---------|-------|
| **lucide-react** | **0.469.0** | Icon library, 1400+ icons |
| **framer-motion** | **11.15.0** | Animation library |
| **react-countup** | **6.5.3** | Number animations |

### Forms & Validation

| Package | Version | Notes |
|---------|---------|-------|
| **react-hook-form** | **7.54.2** | Form state management |
| **zod** | **3.24.1** | Schema validation |
| **@hookform/resolvers** | **3.9.1** | Zod resolver for RHF |

### Utilities

| Package | Version | Notes |
|---------|---------|-------|
| **clsx** | **2.1.1** | Conditional classNames |
| **tailwind-merge** | **2.6.0** | Merge Tailwind classes |
| **date-fns** | **4.1.0** | Date manipulation |
| **sonner** | **1.7.1** | Toast notifications UI |

---

## Backend Stack (apps/backend)

### Core Framework

| Package | Version | Notes |
|---------|---------|-------|
| **@nestjs/core** | **10.4.15** | Latest stable NestJS |
| **@nestjs/common** | **10.4.15** | Common utilities |
| **@nestjs/platform-express** | **10.4.15** | Express adapter |
| **@nestjs/config** | **3.3.0** | Configuration module |
| **@nestjs/terminus** | **10.2.3** | Health checks |
| **reflect-metadata** | **0.2.2** | Decorator metadata |
| **rxjs** | **7.8.1** | Reactive extensions |

### Database & ORM

| Package | Version | Notes |
|---------|---------|-------|
| **@prisma/client** | **6.2.1** | Type-safe database client |
| **prisma** | **6.2.1** | CLI and schema management |
| **pg** | **8.13.1** | PostgreSQL driver |
| **pg-boss** | **10.1.5** | Postgres-based job queue |

### Authentication & Security

| Package | Version | Notes |
|---------|---------|-------|
| **better-auth** | **1.0.7** | Backend auth provider |
| **jose** | **5.9.6** | JWT verification |
| **bcryptjs** | **2.4.3** | Password hashing |

### Utilities & Business Logic

| Package | Version | Notes |
|---------|---------|-------|
| **mathjs** | **13.2.2** | Unit conversion, calculations |
| **date-fns** | **4.1.0** | Date utilities |
| **class-validator** | **0.14.1** | DTO validation |
| **class-transformer** | **0.5.1** | DTO transformation |

---

## Scraping & Orchestration (packages/ingestion-workers)

| Package | Version | Notes |
|---------|---------|-------|
| **playwright** | **1.49.1** | Browser automation |
| **@playwright/test** | **1.49.1** | Testing utilities |
| **cheerio** | **1.0.0** | HTML parsing (lightweight) |

### Workflow Orchestration

| Package | Version | Notes |
|---------|---------|-------|
| **temporalite** | **0.3.0** | Single-node Temporal server |
| **@temporalio/client** | **1.11.3** | Temporal TypeScript client |
| **@temporalio/worker** | **1.11.3** | Workflow worker |
| **@temporalio/workflow** | **1.11.3** | Workflow definitions |

---

## Database & Infrastructure

| Service | Version | Provider | Notes |
|---------|---------|----------|-------|
| **PostgreSQL** | **15.10** | Supabase | Managed, free tier 500MB |
| **Redis** | **7.4** | Upstash | Free tier 10K commands/day |
| **Supabase Storage** | - | Supabase | S3-compatible, free tier 1GB |

---

## Development & Testing

### Testing Frameworks

| Package | Version | Notes |
|---------|---------|-------|
| **vitest** | **2.1.8** | Unit testing (Vite-native) |
| **@vitest/ui** | **2.1.8** | Test UI dashboard |
| **@testing-library/react** | **16.1.0** | React component testing |
| **@testing-library/jest-dom** | **6.6.3** | Custom matchers |
| **@testing-library/user-event** | **14.5.2** | User interaction simulation |
| **playwright** | **1.49.1** | E2E testing |
| **msw** | **2.7.0** | API mocking |

### Linting & Formatting

| Package | Version | Notes |
|---------|---------|-------|
| **eslint** | **9.17.0** | Linting (flat config) |
| **@typescript-eslint/parser** | **8.19.1** | TypeScript parser |
| **@typescript-eslint/eslint-plugin** | **8.19.1** | TypeScript rules |
| **eslint-config-next** | **15.1.3** | Next.js ESLint config |
| **prettier** | **3.4.2** | Code formatting |
| **prettier-plugin-tailwindcss** | **0.6.9** | Tailwind class sorting |

### Build & Tooling

| Package | Version | Notes |
|---------|---------|-------|
| **nx** | **20.3.2** | Monorepo build system with caching |
| **tsx** | **4.19.2** | TypeScript execution |
| **tsup** | **8.3.5** | TypeScript bundler |
| **esbuild** | **0.24.2** | Fast bundler |

---

## Monitoring & Observability

### OpenTelemetry

| Package | Version | Notes |
|---------|---------|----------|
| **@opentelemetry/sdk-node** | **0.55.0** | Node.js SDK |
| **@opentelemetry/auto-instrumentations-node** | **0.52.1** | Auto instrumentation |
| **@opentelemetry/exporter-prometheus** | **0.55.0** | Prometheus exporter |

### Logging

| Package | Version | Notes |
|---------|---------|-------|
| **pino** | **9.5.0** | Fast JSON logger |
| **pino-pretty** | **13.0.0** | Dev-friendly formatting |

---

## CI/CD & Deployment

| Tool | Version | Notes |
|------|---------|-------|
| **GitHub Actions** | - | CI/CD platform |
| **Vercel CLI** | **38.0.1** | Frontend deployment |
| **Railway CLI** | **3.18.3** | Backend deployment (alternative) |
| **Render** | - | Backend deployment (alternative) |

---

## Version Management Policies

### Dependency Update Strategy

**Automated Updates (Renovate Bot):**
```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true,
      "automergeType": "pr",
      "schedule": ["after 10pm every weekday"]
    },
    {
      "matchUpdateTypes": ["minor"],
      "groupName": "minor dependencies",
      "schedule": ["before 3am on Monday"]
    },
    {
      "matchUpdateTypes": ["major"],
      "labels": ["major-update"],
      "assignees": ["@team-lead"]
    }
  ]
}
```

**Manual Review Required:**
- Major version updates (breaking changes)
- Framework updates (Next.js, NestJS, React)
- Database client updates (Prisma)

### Security Update SLAs

| Severity | Response Time | Deployment Window |
|----------|---------------|-------------------|
| **Critical** | 4 hours | 24 hours |
| **High** | 24 hours | 7 days |
| **Medium** | 7 days | 30 days |
| **Low** | 30 days | Next sprint |

### Version Pinning Strategy

**Exact Versions (no semver ranges):**
```json
{
  "dependencies": {
    "next": "15.1.3",           // ✅ Exact version
    "react": "18.3.1",          // ✅ Not "^18.3.1"
    "@reduxjs/toolkit": "2.5.0" // ✅ Not "~2.5.0"
  }
}
```

**Why:** Ensures reproducible builds across all environments

### Compatibility Matrix

| Next.js | React | Node.js | TypeScript | Notes |
|---------|-------|---------|------------|-------|
| 15.1.3 | 18.3.1 | 20.11.1+ | 5.7.2 | Current stable |
| 14.2.x | 18.3.x | 18.17+ | 5.x | Legacy support |

---

## Upgrade Calendar

### Q1 2025 (Jan-Mar)
- ✅ **Completed:** Initial version specifications
- 🔄 **In Progress:** Dependency security audit
- 📅 **Planned:** Next.js 15 → 16 evaluation (when released)

### Q2 2025 (Apr-Jun)
- Node.js 20.x → 22.x LTS migration evaluation
- React 18 → 19 when stable
- Prisma 6.x minor updates

### Quarterly Reviews
- Review all dependencies for security advisories
- Evaluate major version upgrades
- Update this document with new versions

---

## Breaking Changes Log

### Next.js 14 → 15 (Completed)
- **App Router**: Now stable, deprecated Pages Router compatibility
- **Turbopack**: Default dev server (faster than Webpack)
- **React 19**: Supported but not required
- **Migration effort**: Low (backward compatible)

### Prisma 5 → 6 (Completed)
- **TypedSQL**: New feature for type-safe raw queries
- **Performance**: 30% faster query generation
- **Breaking changes**: None for basic usage
- **Migration effort**: Low

### pnpm 8 → 9 (Completed)
- **Lockfile v9**: New format (auto-migrated)
- **Workspace improvements**: Better monorepo support
- **Breaking changes**: Lockfile format only
- **Migration effort**: None (auto-upgrade)

---

## Version Verification Commands

```bash
# Frontend
cd apps/web
node --version                    # Should show v20.11.1
pnpm --version                    # Should show 9.14.2
pnpm list next                    # Should show 15.1.3
pnpm list @reduxjs/toolkit        # Should show 2.5.0

# Backend
cd apps/backend
pnpm list @nestjs/core            # Should show 10.4.15
pnpm list prisma                  # Should show 6.2.1

# Monorepo root
pnpm -r list --depth 0            # List all package versions
```

---

## Security Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically (patch/minor)
pnpm audit --fix

# Check for outdated packages
pnpm outdated

# Interactive upgrade wizard
pnpm up --interactive --latest
```

---

## References

- **Node.js Releases:** https://nodejs.org/en/about/previous-releases
- **Next.js Changelog:** https://github.com/vercel/next.js/releases
- **Prisma Releases:** https://github.com/prisma/prisma/releases
- **Redux Toolkit Releases:** https://github.com/reduxjs/redux-toolkit/releases
- **Security Advisories:** https://github.com/advisories
