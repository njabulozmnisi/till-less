# @tillless/scrapers

Playwright-based web scrapers for South African grocery retailers.

## Retailers Supported
- Checkers
- Pick n Pay
- Woolworths
- Shoprite
- Makro

## Stack
- **Browser Automation:** Playwright
- **Scheduler:** Temporalite
- **Queue:** pg-boss
- **Deployment:** Railway (Docker container)

## Development

```bash
# Run scrapers locally
nx serve scrapers

# Build Docker image
nx build scrapers

# Test
nx test scrapers
```

## Deployment
- **Platform:** Railway (background worker, no public URL)
- **Cadence:** 2-4 hour scraping intervals
