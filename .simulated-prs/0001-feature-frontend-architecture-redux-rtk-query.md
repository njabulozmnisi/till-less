# Simulated PR — feat(frontend): add Redux + RTK Query architecture and UI/UX specifications

## Context / Why

The project required a complete frontend architecture specification to guide development of the TillLess web application. The user explicitly requested:

1. **State Management**: Redux (not Zustand, Jotai, or other alternatives)
2. **Data Fetching**: RTK Query for API calls (not React Query, SWR, or direct fetch)
3. **BFF Pattern**: Next.js API routes to proxy calls to the NestJS backend

Previously, the architecture document mentioned "React Query" but didn't have detailed state management specifications. This PR establishes the definitive frontend architecture aligned with user requirements.

## Change Summary

### Documentation Added:
1. **Frontend UI/UX Specification** (`docs/front-end-spec.md`)
   - User personas, usability goals, and design principles
   - Complete information architecture and sitemap
   - 4 detailed user flows with Mermaid diagrams
   - 8 key screen wireframes/mockups
   - shadcn/ui component library specifications
   - Tailwind CSS design system (colors, typography, spacing)
   - Accessibility requirements (WCAG 2.1 Level AA)
   - Responsive strategy and animation guidelines

2. **Figma Design Handoff Guide** (`docs/figma-handoff-guide.md`)
   - Project setup and file structure
   - Complete design tokens (30+ colors, 12 text styles, 7 spacing tiers)
   - 8 component specifications mapped to shadcn/ui
   - Screen design briefs for mobile/tablet/desktop
   - Figma plugins and workflow recommendations

3. **Frontend Architecture** (`docs/architecture/frontend-architecture.md`)
   - Redux Toolkit store configuration
   - 4 Redux slices: Auth, UI, Preferences, Optimization
   - RTK Query API definitions for all endpoints
   - Next.js API routes structure and integration
   - Component integration examples
   - Performance optimization strategies
   - Testing strategy with examples
   - Security considerations
   - Migration path and best practices

4. **API Routes BFF Pattern** (`docs/architecture/api-routes-bff.md`)
   - Base API handler for proxying to NestJS backend
   - JWT token validation
   - Error normalization
   - Response caching with Upstash Redis
   - Complete API route structure (lists, optimization, preferences, receipts, retailers)
   - Request/response transformation examples
   - Performance optimizations (batching, compression, retry logic)
   - Security best practices
   - Testing and monitoring strategies

5. **Git Flow Guidelines** (`CLAUDE.md`)
   - Branch naming conventions
   - Commit standards (Conventional Commits)
   - Simulated PR workflow
   - Merge rules and strategies

### Architecture Updates:
- Updated technology stack to include Redux + RTK Query + Next.js API Routes
- Enhanced component breakdown with detailed BFF layer description
- Updated high-level architecture diagram showing frontend → API Routes → Backend flow
- Expanded source tree to show Redux store structure
- Added references to new frontend documentation

## Diff Stat
```
 CLAUDE.md                                          |  122 ++
 docs/architecture.md                               |    3 +
 .../03-3-high-level-architecture-overview.md       |   29 +-
 docs/architecture/04-4-component-breakdown.md      |   14 +-
 docs/architecture/06-6-technology-stack.md         |    3 +-
 docs/architecture/api-routes-bff.md                |  978 +++++++++
 docs/architecture/frontend-architecture.md         |  946 +++++++++
 docs/architecture/source-tree.md                   |    9 +-
 docs/figma-handoff-guide.md                        | 1883 +++++++++++++++++
 docs/front-end-spec.md                             | 2152 ++++++++++++++++++++
 10 files changed, 6123 insertions(+), 16 deletions(-)
```

## Risks & Impact

### Security
✅ **Low Risk**
- No code changes, documentation only
- Security best practices documented (JWT validation, input sanitization, rate limiting)
- CORS and CSP configuration guidelines provided

### Performance
✅ **Positive Impact**
- BFF pattern enables better caching strategies
- RTK Query provides automatic request deduplication and cache management
- Performance optimization strategies documented

### Data Migrations
✅ **N/A**
- No database changes
- Documentation-only PR

### User-Visible Changes
✅ **None (yet)**
- No implementation changes
- Sets foundation for future frontend development

### Developer Experience
✅ **Positive Impact**
- Clear architecture guidance for frontend development
- Complete examples for Redux slices, RTK Query, and API routes
- Testing strategies with code samples
- Reduces decision paralysis and inconsistent patterns

## Test Plan

### Automated Tests
- **N/A** - Documentation-only PR
- Future PRs implementing this architecture will include:
  - Unit tests for Redux slices
  - Integration tests for RTK Query endpoints
  - E2E tests for user flows

### Manual Steps
1. ✅ Review all documentation for clarity and completeness
2. ✅ Verify Mermaid diagrams render correctly
3. ✅ Check code examples for syntax correctness
4. ✅ Ensure consistency between documents
5. ✅ Validate alignment with PRD requirements
6. ✅ Confirm Redux/RTK Query addresses user's requirements

## Checks

- [x] Lint clean (documentation files)
- [x] Typecheck clean (N/A - no code)
- [x] Tests pass (N/A - no code)
- [x] Secret scan clean (no secrets in documentation)

## Self-Review Notes

### Strengths
1. **Comprehensive Coverage**: All aspects of frontend architecture documented
2. **User Requirements Met**: Redux + RTK Query + Next.js API routes as specified
3. **Practical Examples**: Real code samples for all major patterns
4. **Testing Guidance**: Test examples for slices, APIs, and components
5. **Security Focused**: Authentication, validation, and error handling well-documented
6. **Performance Conscious**: Caching, optimization, and best practices included
7. **Accessibility**: WCAG 2.1 Level AA compliance requirements documented
8. **South African Context**: Rand formatting, retailer names, Gauteng geography

### Areas for Future Enhancement
1. **Mobile App**: Currently web-only; Phase 2 could add React Native architecture
2. **OCR Integration**: Receipt scanning documented for Phase 1.5
3. **Real-time Features**: WebSocket/SSE patterns not yet documented
4. **Offline Support**: Service worker and offline-first patterns for future
5. **Multi-language**: i18n architecture not yet defined

### Potential Concerns
1. **Bundle Size**: Redux + RTK Query + shadcn/ui adds weight
   - **Mitigation**: Code splitting, tree-shaking, performance budgets documented
2. **Learning Curve**: Redux can be complex for new developers
   - **Mitigation**: Comprehensive examples and patterns provided
3. **Over-engineering**: Might be too complex for MVP
   - **Mitigation**: User explicitly requested Redux; aligns with Phase 1 requirements

### Follow-ups
1. Create implementation stories/tasks based on this architecture
2. Set up project scaffolding with Redux + RTK Query + shadcn/ui
3. Implement authentication flow using BetterAuth
4. Create component library in Storybook
5. Build out first feature (Shopping Lists) as reference implementation

## Related Documents
- PRD: `docs/prd.md`
- Canonical Product Registry: `docs/canonical-product-registry.md`
- Retailer Scraping Playbook: `docs/retailer-scraping-playbook.md`

## Approval

✅ **APPROVED**

This PR provides comprehensive frontend architecture documentation that:
- Addresses user's explicit requirements (Redux + RTK Query + Next.js API)
- Aligns with PRD goals and success metrics
- Follows industry best practices
- Provides clear implementation guidance
- Maintains consistency with existing backend architecture
- Supports scalability and maintainability goals

Ready to squash-merge into `develop`.
