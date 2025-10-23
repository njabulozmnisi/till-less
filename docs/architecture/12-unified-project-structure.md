# 12. Unified Project Structure

**Full monorepo tree:** (See Section 2.3 for overview)

**Path Aliases in tsconfig.base.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@tillless/ui": ["packages/ui/src/index.ts"],
      "@tillless/api-client": ["packages/api-client/src/index.ts"],
      "@tillless/database": ["packages/database/src/index.ts"],
      "@tillless/types": ["packages/types/src/index.ts"],
      "@tillless/utils": ["packages/utils/src/index.ts"]
    }
  }
}
```
