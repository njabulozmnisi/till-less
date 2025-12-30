import { Injectable, Logger } from '@nestjs/common';
import { IngestionStrategy } from '@prisma/client';
import { chromium, Browser, Page } from 'playwright';
import {
  IDataAcquisitionStrategy,
  IngestionResult,
  StrategyConfig,
  ScrapedProduct,
} from '../interfaces';
import { PrismaService } from '../../common/prisma.service';

/**
 * Web scraper strategy using Playwright
 * Extracts product data from retailer websites
 */
@Injectable()
export class ScraperStrategy implements IDataAcquisitionStrategy {
  readonly strategyType = IngestionStrategy.SCRAPER;
  private readonly logger = new Logger(ScraperStrategy.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute web scraping for a retailer
   */
  async execute(config: StrategyConfig, retailerId: string): Promise<IngestionResult> {
    const startTime = new Date();
    const errors: string[] = [];
    let itemsIngested = 0;

    let browser: Browser | null = null;

    try {
      // Validate configuration
      if (!this.validate(config)) {
        throw new Error('Invalid scraper configuration');
      }

      this.logger.log(`Starting scrape for retailer ${retailerId} at ${config.url}`);

      // Launch browser
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Navigate to URL
      await page.goto(config.url!, { waitUntil: 'networkidle' });

      // Wait for products to load
      if (config.selectors?.productContainer) {
        await page.waitForSelector(config.selectors.productContainer, { timeout: 10000 });
      }

      // Extract products
      const products = await this.extractProducts(page, config);

      this.logger.log(`Extracted ${products.length} products from ${config.url}`);

      // Store products in database
      for (const product of products) {
        try {
          await this.storeProduct(product, retailerId);
          itemsIngested++;
        } catch (error) {
          const errorMsg = `Failed to store product ${product.name}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      await browser.close();

      return {
        success: errors.length === 0,
        itemsIngested,
        errors,
        timestamp: new Date(),
        metadata: {
          url: config.url,
          productsFound: products.length,
          duration: Date.now() - startTime.getTime(),
        },
      };
    } catch (error) {
      if (browser) {
        await browser.close();
      }

      const errorMsg = `Scraping failed: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMsg);
      errors.push(errorMsg);

      return {
        success: false,
        itemsIngested,
        errors,
        timestamp: new Date(),
        metadata: {
          url: config.url,
          duration: Date.now() - startTime.getTime(),
        },
      };
    }
  }

  /**
   * Extract products from page using configured selectors
   */
  private async extractProducts(page: Page, config: StrategyConfig): Promise<ScrapedProduct[]> {
    const selectors = config.selectors || {};

    return await page.evaluate((sel) => {
      const products: ScrapedProduct[] = [];
      const productElements = document.querySelectorAll(sel.productContainer || '.product');

      productElements.forEach((elem) => {
        try {
          const nameElem = elem.querySelector(sel.name || '.product-name');
          const priceElem = elem.querySelector(sel.price || '.product-price');
          const stockElem = elem.querySelector(sel.inStock || '.product-stock');
          const imageElem = elem.querySelector(sel.image || '.product-image') as HTMLImageElement;

          const name = nameElem?.textContent?.trim() || '';
          const priceText = priceElem?.textContent?.trim() || '0';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          const inStock = stockElem ? !stockElem.textContent?.toLowerCase().includes('out of stock') : true;
          const imageUrl = imageElem?.src || '';

          if (name && !isNaN(price)) {
            products.push({
              name,
              price,
              inStock,
              imageUrl: imageUrl || undefined,
            });
          }
        } catch (error) {
          console.error('Error extracting product:', error);
        }
      });

      return products;
    }, selectors);
  }

  /**
   * Store product in database
   */
  private async storeProduct(product: ScrapedProduct, retailerId: string): Promise<void> {
    // Create or update retailer item directly (no separate Product table for now)
    const sku = product.sku || `generated-${product.name.toLowerCase().replace(/\s+/g, '-')}`;

    await this.prisma.retailerItem.upsert({
      where: {
        retailerId_sku: {
          retailerId,
          sku,
        },
      },
      update: {
        name: product.name,
        price: product.price,
        inStock: product.inStock,
        lastScraped: new Date(),
      },
      create: {
        retailerId,
        sku,
        name: product.name,
        price: product.price,
        inStock: product.inStock,
        lastScraped: new Date(),
      },
    });
  }

  /**
   * Validate scraper configuration
   */
  validate(config: StrategyConfig): boolean {
    if (!config.url) {
      this.logger.error('Scraper config missing required field: url');
      return false;
    }

    if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      this.logger.error('Scraper config url must be a valid HTTP/HTTPS URL');
      return false;
    }

    return true;
  }

  /**
   * Get strategy description
   */
  getDescription(): string {
    return 'Web scraper using Playwright for headless browser automation';
  }
}
