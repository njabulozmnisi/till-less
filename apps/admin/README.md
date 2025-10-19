# TillLess Admin Panel

Admin panel for manual leaflet entry, OCR review queue, and system monitoring.

## Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** BetterAuth (admin role required)

## Features
- Manual leaflet entry (Week 3)
- OCR upload and review queue (Week 4)
- Scraper monitoring dashboard
- Product matching review

## Development

```bash
# Run dev server
nx serve admin

# Build
nx build admin

# Lint
nx lint admin
```

## Deployment
- **Platform:** Vercel (optional separate deployment)
- Can be integrated into main web app at `/admin` route
