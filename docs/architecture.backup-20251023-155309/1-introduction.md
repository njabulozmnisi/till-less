# 1. Introduction

## 1.1 Starter Template or Existing Project

**Decision:** N/A - Greenfield project with manual scaffolding using Nx generators

**Finding:** This is a greenfield project with clear technical preferences specified in the PRD:
- **Monorepo:** Nrwl Nx (explicitly preferred over Turborepo)
- **Frontend:** Next.js 15 + Tailwind CSS v4 + Shadcn UI
- **Backend:** NestJS with DDD bounded contexts
- **Database:** Supabase Postgres + Prisma ORM
- **API:** tRPC for type-safe communication

**Recommendation:** Use Nx official generators (`@nx/next`, `@nx/nest`, `@nx/expo`) for consistent structure, install Shadcn UI components as needed (copy-paste approach).

**Constraints from PRD:**
- Must use Nx monorepo (not Turborepo, not pnpm workspaces)
- Must implement DDD bounded contexts in NestJS
- Must use Tailwind v4 with OKLCH colors
- Must target ~R150/month infrastructure cost
- Must achieve Lighthouse ≥90, <2s optimization time

## 1.2 Overview

This document outlines the complete full-stack architecture for **TillLess**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

TillLess is a category-aware grocery shopping optimization platform that helps South African shoppers save 8%+ (R240+ per basket) by intelligently splitting purchases across multiple retailers at the category level. The architecture implements Domain-Driven Design (DDD) principles with bounded contexts, supports both web (PWA) and future mobile (React Native) clients, and integrates multiple data acquisition strategies (web scraping, PDF OCR, manual entry, crowdsourced submissions).

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern full-stack applications where these concerns are increasingly intertwined.

## 1.3 Change Log

| Date       | Version | Description                                      | Author              |
|------------|---------|--------------------------------------------------|---------------------|
| 2025-10-22 | 4.0     | Complete fullstack architecture with DDD + tRPC | Winston (Architect) |

---
