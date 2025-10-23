# 6. Epic Details

*Note: Due to length constraints, this section provides detailed stories for Epic 1 only. Epics 2-8 follow the same pattern with user stories and acceptance criteria. Full epic details are available in the working document.*

## Epic 1: Foundation & Authentication Infrastructure

**Goal:** Establish project infrastructure, authentication system, and basic user management to enable all subsequent feature development.

**Duration:** 2 weeks (40 hours)

---

### Story 1.1: Initialize Nx Monorepo with Core Applications

As a **developer**,
I want **an Nx monorepo with Next.js (web), NestJS (api), and shared packages configured**,
so that **I can develop web and backend applications with shared code and optimized build workflows**.

**Acceptance Criteria:**

1. Given the project requirements, when I run `npx create-nx-workspace@latest tillless`, then an Nx workspace is created with pnpm.
2. Given the Nx workspace, when I run `nx g @nx/next:app web`, then a Next.js 15 application is created with App Router, TypeScript, Tailwind CSS v4.
3. Given the Nx workspace, when I run `nx g @nx/nest:app api`, then a NestJS application is created with TypeScript strict mode.
4. Given the monorepo, when I create shared packages (`ui`, `utils`, `types`), then packages are created with proper TypeScript path aliases.
5. Given the Nx configuration, when I run `nx run-many --target=build --all`, then all apps and packages build successfully.
6. Given the workspace, when I inspect `nx.json`, then task pipeline caching is enabled.
7. Given development, when I run `nx serve web` and `nx serve api` in parallel, then web runs on `localhost:3000` and API on `localhost:4000`.

---

### Story 1.2: Configure Tailwind CSS v4 and Shadcn UI

As a **frontend developer**,
I want **Tailwind CSS v4 and Shadcn UI configured**,
so that **I can build accessible UI components with a consistent design system**.

**Acceptance Criteria:**

1. Given Next.js, when I install Tailwind CSS v4, then it's configured in `tailwind.config.ts`.
2. Given Tailwind, when I define OKLCH colors (primary, secondary, accent), then they're available as CSS variables.
3. Given Next.js, when I run `npx shadcn@latest init`, then Shadcn UI is configured.
4. Given Shadcn, when I run `npx shadcn@latest add button card badge alert`, then components are copied to `components/ui/`.
5. Given test page, when I render Shadcn components, then they display correctly with dark mode support.
6. Given globals.css, when I add `:root` and `.dark` CSS variables, then light/dark mode renders correctly.
7. Given build, when I run `nx build web`, then CSS bundle size <50KB gzipped.

---

### Story 1.3: Set Up Supabase Postgres Database and Prisma ORM

As a **backend developer**,
I want **Supabase Postgres configured with Prisma ORM**,
so that **I can define schemas, run migrations, and query data with type safety**.

**Acceptance Criteria:**

1. Given Supabase account, when I create project (EU region), then I receive connection string.
2. Given API, when I install Prisma, then CLI is available.
3. Given Prisma, when I run `npx prisma init`, then `schema.prisma` and `.env` are created.
4. Given schema, when I configure `DATABASE_URL`, then Prisma can connect to Supabase.
5. Given schema, when I define `User` model, then schema is valid.
6. Given schema, when I run `npx prisma migrate dev --name init`, then migration is created and applied.
7. Given migration, when I run `npx prisma generate`, then Prisma Client types are generated.
8. Given Prisma Client, when I create Prisma service in NestJS, then service is available for dependency injection.
9. Given service, when API starts, then database connection succeeds with log "Database connected".

---

*[Stories 1.4-1.9 follow similar pattern: User authentication, profile management, tRPC setup, session management, CI/CD pipeline, health checks]*

---

**Epics 2-8:** Follow the same detailed story format with user stories (As a/I want/So that) and comprehensive acceptance criteria. Each story is sized for 2-4 hour completion by an AI agent.

**Total Stories Across All Epics: 65**

---
