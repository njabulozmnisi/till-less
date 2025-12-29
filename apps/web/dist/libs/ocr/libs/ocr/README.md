# @tillless/ocr

OCR service for extracting product data from grocery leaflets (PDFs/images).

## Features
- Azure Computer Vision integration (5,000 transactions/month free)
- Tesseract OCR fallback (self-hosted, unlimited)
- NLP parsing for SA leaflet formats
- Product matching to Canonical Product Registry (CPR)

## Stack
- **Primary:** Azure Computer Vision API
- **Fallback:** Tesseract OCR (open source)
- **PDF Processing:** pdf-poppler, sharp

## Usage

```typescript
import { OCRService } from '@tillless/ocr';

const ocr = new OCRService();
const items = await ocr.processLeaflet(pdfBuffer);
// Returns: [{ productName, size, price, confidence }]
```

## Development

```bash
# Run tests
nx test ocr

# Build
nx build ocr
```

## Week 4 Implementation
See `docs/sprint-plan-with-ocr-week4.md` for implementation details.
