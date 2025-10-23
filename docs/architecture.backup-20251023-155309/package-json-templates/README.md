# Package.json Templates

This directory contains reference `package.json` files for all TillLess workspace packages. These templates define **exact versions** for all dependencies to ensure reproducible builds across environments.

## 📋 Available Templates

| Template | Purpose | Location |
|----------|---------|----------|
| **root-package.json** | Monorepo root configuration | Copy to project root as `package.json` |
| **frontend-package.json** | Next.js web application | Copy to `apps/web/package.json` |
| **backend-package.json** | NestJS API server | Copy to `apps/backend/package.json` |
| **scraping-workers-package.json** | Playwright scraping workers | Copy to `packages/ingestion-workers/package.json` |
| **pnpm-workspace.yaml** | pnpm workspace configuration | Copy to project root |

## 🚀 Quick Start

### 1. Initialize Monorepo

```bash
# From project root
cd /path/to/tillless

# Copy root configuration
cp docs/architecture/package-json-templates/root-package.json ./package.json
cp docs/architecture/package-json-templates/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
pnpm install
```

### 2. Setup Frontend Application

```bash
# Create app directory
mkdir -p apps/web

# Copy package.json
cp docs/architecture/package-json-templates/frontend-package.json apps/web/package.json

# Install dependencies
cd apps/web
pnpm install

# Verify installation
pnpm dev
```

### 3. Setup Backend Application

```bash
# Create app directory
mkdir -p apps/backend

# Copy package.json
cp docs/architecture/package-json-templates/backend-package.json apps/backend/package.json

# Install dependencies
cd apps/backend
pnpm install

# Setup Prisma
pnpm prisma:generate
```

### 4. Setup Scraping Workers

```bash
# Create package directory
mkdir -p packages/ingestion-workers

# Copy package.json
cp docs/architecture/package-json-templates/scraping-workers-package.json packages/ingestion-workers/package.json

# Install dependencies
cd packages/ingestion-workers
pnpm install

# Install Playwright browsers
pnpm playwright install chromium
```

## 🔧 Version Management

### Exact Version Pinning

All dependencies use **exact versions** (no `^` or `~`):

```json
{
  "dependencies": {
    "next": "15.1.3",           // ✅ Exact version
    "react": "18.3.1"            // ✅ Not "^18.3.1"
  }
}
```

**Why?** Ensures identical dependency resolution across all environments (dev, CI, staging, production).

### Updating Dependencies

**Option 1: Manual Update (Recommended for major versions)**

```bash
# Check outdated packages
pnpm outdated

# Update specific package
pnpm up next@15.2.0 --filter @tillless/web

# Update package.json template
vim docs/architecture/package-json-templates/frontend-package.json
# Change: "next": "15.1.3" → "next": "15.2.0"
```

**Option 2: Interactive Update**

```bash
# Interactive upgrade wizard
pnpm up --interactive --latest

# Or use taze for better UX
pnpx taze
```

**Option 3: Automated via Renovate (Production)**

Configure `.github/renovate.json`:

```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true
    }
  ]
}
```

### Security Updates

**Critical CVE Response:**

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically (patches only)
pnpm audit --fix

# For unfixable vulnerabilities, evaluate:
# 1. Upgrade to patched version
# 2. Find alternative package
# 3. Implement workaround + document risk
```

## 📦 Workspace Structure

```
tillless/
├── package.json                 # Root config (nx, prettier, husky)
├── pnpm-workspace.yaml          # Workspace definition
├── nx.json                      # Nx configuration (build caching, tasks)
├── pnpm-lock.yaml               # Dependency lock (auto-generated)
├── apps/
│   ├── web/
│   │   └── package.json         # Frontend app
│   ├── backend/
│   │   └── package.json         # Backend API
│   └── ingestion-dashboard/     # (Optional) Ops dashboard
│       └── package.json
├── packages/
│   ├── ingestion-workers/
│   │   └── package.json         # Scraping workers
│   ├── ingestion-shared/
│   │   └── package.json         # Shared scraping utilities
│   ├── queue-consumers/
│   │   └── package.json         # pg-boss consumers
│   └── types/
│       └── package.json         # Shared TypeScript types
└── docs/
    └── architecture/
        └── package-json-templates/  # This directory
```

## 🔍 Version Verification

### Check Installed Versions

```bash
# Frontend versions
cd apps/web
pnpm list next react @reduxjs/toolkit

# Backend versions
cd apps/backend
pnpm list @nestjs/core prisma

# All versions across workspace
pnpm -r list --depth 0
```

### Verify Node.js and pnpm

```bash
# Check Node.js version
node --version
# Expected: v20.11.1

# Check pnpm version
pnpm --version
# Expected: 9.14.2

# Check TypeScript version (should be consistent)
pnpm -r exec tsc --version
# Expected: Version 5.7.2
```

## 🛠️ Troubleshooting

### Lock File Conflicts

```bash
# Regenerate lock file
rm pnpm-lock.yaml
pnpm install

# Verify integrity
pnpm install --frozen-lockfile
```

### Version Mismatches Between Packages

```bash
# Deduplicate dependencies
pnpm dedupe

# Check for duplicates
pnpm list --depth=99 | grep -E "^├─|^│ {2}├─" | sort | uniq -d
```

### TypeScript Version Conflicts

All packages should use the same TypeScript version. Configure in root `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "typescript": "5.7.2"
    }
  }
}
```

### Playwright Browser Installation Issues

```bash
# Install browsers with dependencies
pnpm --filter @tillless/ingestion-workers playwright install --with-deps chromium

# Or use Docker for consistent browser versions
docker pull mcr.microsoft.com/playwright:v1.49.1
```

## 📚 Additional Resources

- **Full Version Spec**: `../technology-versions.md`
- **Frontend Architecture**: `../frontend-architecture.md`
- **Backend Architecture**: `../04-4-component-breakdown.md`
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Nx Documentation**: https://nx.dev/getting-started/intro

## ⚠️ Important Notes

1. **Never use version ranges** (`^`, `~`, `*`) in production projects
2. **Commit `pnpm-lock.yaml`** to version control
3. **Run `pnpm install --frozen-lockfile`** in CI/CD pipelines
4. **Update templates** when bumping dependency versions
5. **Test thoroughly** after major version upgrades
6. **Review changelog** before updating framework versions (Next.js, NestJS)

## 🔄 Template Maintenance

When updating versions in these templates:

1. ✅ Update `technology-versions.md` first
2. ✅ Update all `package.json` templates
3. ✅ Update `architecture.md` and `frontend-architecture.md`
4. ✅ Test with fresh installation
5. ✅ Update this README if scripts change
6. ✅ Commit all changes together with descriptive message

---

**Last Updated:** 2025-01-19
**Maintained By:** Architecture Team
**Questions?** See `docs/architecture/technology-versions.md` for version policies
