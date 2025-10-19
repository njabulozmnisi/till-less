# @tillless/shared

Shared TypeScript types, utilities, and constants used across all apps and libraries.

## Contents

### Types (`/src/types`)
- Product types (CanonicalProduct, RetailerPrice)
- User types (User, Preferences)
- Optimization types (OptimizationRequest, OptimizationResult)
- Leaflet types (Leaflet, LeafletItem)

### Utils (`/src/utils`)
- Price formatting (R123.45)
- Distance calculations
- Date utilities
- Validation helpers

### Constants (`/src/constants`)
- Retailer configurations
- Loyalty program rules
- Travel cost parameters

## Usage

```typescript
import { CanonicalProduct, formatPrice } from '@tillless/shared';

const price = formatPrice(123.45); // "R123.45"
```

## Development

```bash
# Build
nx build shared

# Lint
nx lint shared

# Test
nx test shared
```
