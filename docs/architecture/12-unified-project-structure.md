# 12. Unified Project Structure

**Full monorepo tree:** (See Section 2.3 for overview)

**Nx-managed monorepo with pnpm workspaces:**
- `apps/*` - Deployable applications (web, api, admin, backend)
- `libs/*` - Shared libraries managed by Nx

**Path Aliases in tsconfig.base.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@tillless/database": ["libs/database/src/index.ts"],
      "@tillless/scrapers": ["libs/scrapers/src/index.ts"],
      "@tillless/ocr": ["libs/ocr/src/index.ts"],
      "@tillless/shared": ["libs/shared/src/index.ts"],
      "@tillless/shared/types": ["libs/shared/src/types/index.ts"],
      "@tillless/shared/utils": ["libs/shared/src/utils/index.ts"],
      "@tillless/shared/constants": ["libs/shared/src/constants/index.ts"]
    }
  }
}
```
