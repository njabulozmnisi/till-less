# 17. Coding Standards

## 17.1 TypeScript

- **Strict mode enabled**
- **No `any` types** (use `unknown` if needed)
- **Explicit return types** on functions
- **Zod schemas** for runtime validation

## 17.2 React/Next.js

- **Server Components by default**
- **Client Components** only when needed (`'use client'`)
- **Functional components** with hooks
- **Props interfaces** exported for reuse

## 17.3 NestJS

- **Dependency injection** for all services
- **DTOs** for all inputs/outputs
- **Guards** for auth checks
- **Interceptors** for logging
- **Repository pattern** for data access

## 17.4 File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Styles: `kebab-case.css`
- Tests: `*.test.ts` or `*.spec.ts`

## 17.5 Code Formatting

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```
