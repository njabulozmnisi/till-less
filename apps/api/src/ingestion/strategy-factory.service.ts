import { Injectable, BadRequestException } from '@nestjs/common';
import { IngestionStrategy } from '@prisma/client';
import { IDataAcquisitionStrategy } from './interfaces';

/**
 * Factory service for creating data acquisition strategies
 * Implements Factory pattern for strategy instantiation
 */
@Injectable()
export class StrategyFactoryService {
  private strategies: Map<IngestionStrategy, IDataAcquisitionStrategy> = new Map();

  /**
   * Register a strategy implementation
   * @param strategy The strategy implementation to register
   */
  registerStrategy(strategy: IDataAcquisitionStrategy): void {
    this.strategies.set(strategy.strategyType, strategy);
  }

  /**
   * Get a strategy instance by type
   * @param type The type of strategy to retrieve
   * @returns The strategy implementation
   * @throws BadRequestException if strategy type is not supported
   */
  getStrategy(type: IngestionStrategy): IDataAcquisitionStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new BadRequestException(
        `Unsupported ingestion strategy: ${type}. ` +
        `Supported strategies: ${Array.from(this.strategies.keys()).join(', ')}`
      );
    }

    return strategy;
  }

  /**
   * Check if a strategy type is supported
   * @param type The strategy type to check
   * @returns true if supported, false otherwise
   */
  isStrategySupported(type: IngestionStrategy): boolean {
    return this.strategies.has(type);
  }

  /**
   * Get all supported strategy types
   * @returns Array of supported strategy types
   */
  getSupportedStrategies(): IngestionStrategy[] {
    return Array.from(this.strategies.keys());
  }
}
