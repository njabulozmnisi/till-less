# 7. External APIs

## 7.1 Google Cloud Vision API

**Purpose:** OCR for PDF catalogues and crowdsourced images

**Integration:** (`libs/retailer-adapters/src/strategies/pdf-ocr.strategy.ts`)
```typescript
import vision from '@google-cloud/vision';

export class PDFOCRStrategy implements IDataAcquisitionStrategy {
  private client = new vision.ImageAnnotatorClient();
  
  async extractPrices(pdfPath: string): Promise<PriceData[]> {
    const [result] = await this.client.textDetection(pdfPath);
    const text = result.fullTextAnnotation?.text || '';
    
    // Parse text for product names and prices
    return this.parsePriceData(text);
  }
}
```

**Rate Limits:** 1800 requests/minute (free tier)
**Cost:** First 1000 requests/month free, then $1.50/1000

## 7.2 Social Media APIs (Phase 1.5)

**Twitter API v2:** Monitor #tillless hashtag for price submissions
**Instagram Graph API:** Parse stories/posts with hashtag
**Facebook Graph API:** Monitor group posts

## 7.3 Retailer Integration APIs

**Checkers Sixty60 API:** Deep link for basket export
**Pick n Pay ASAP API:** Deep link for basket export
**Woolworths Dash API:** Deep link for basket export
