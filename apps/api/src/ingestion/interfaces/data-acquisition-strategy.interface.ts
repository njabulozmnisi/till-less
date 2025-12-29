import { IngestionStrategy } from '@prisma/client';

/**
 * Result of a data ingestion operation
 */
export interface IngestionResult {
  success: boolean;
  itemsIngested: number;
  errors: string[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Generic configuration for data acquisition strategies
 */
export interface StrategyConfig {
  url?: string;
  selectors?: Record<string, string>;
  apiKey?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Scraped product data structure
 */
export interface ScrapedProduct {
  name: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
  sku?: string;
  category?: string;
  description?: string;
}

/**
 * Interface for data acquisition strategies
 * Implements Strategy pattern for pluggable data sources
 */
export interface IDataAcquisitionStrategy {
  /**
   * The type of strategy (matches IngestionStrategy enum)
   */
  readonly strategyType: IngestionStrategy;

  /**
   * Execute the data acquisition process
   * @param config Strategy-specific configuration
   * @param retailerId ID of the retailer to ingest data for
   * @returns Result of the ingestion operation
   */
  execute(config: StrategyConfig, retailerId: string): Promise<IngestionResult>;

  /**
   * Validate the configuration before execution
   * @param config Strategy-specific configuration
   * @returns true if config is valid, false otherwise
   */
  validate(config: StrategyConfig): boolean;

  /**
   * Get a description of what this strategy does
   */
  getDescription(): string;
}
