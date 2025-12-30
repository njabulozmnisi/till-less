import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StrategyFactoryService } from './strategy-factory.service';
import { CreateIngestionConfigDto, UpdateIngestionConfigDto } from './dto';
import { IngestionResult } from './interfaces';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly strategyFactory: StrategyFactoryService
  ) {}

  /**
   * Get all ingestion configs for a retailer
   */
  async findAllForRetailer(retailerId: string) {
    return this.prisma.retailerIngestionConfig.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single ingestion config by ID
   */
  async findOne(id: string) {
    const config = await this.prisma.retailerIngestionConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Ingestion config with ID ${id} not found`);
    }

    return config;
  }

  /**
   * Create a new ingestion config
   */
  async create(retailerId: string, dto: CreateIngestionConfigDto) {
    // Verify retailer exists
    const retailer = await this.prisma.retailer.findUnique({
      where: { id: retailerId },
    });

    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${retailerId} not found`);
    }

    return this.prisma.retailerIngestionConfig.create({
      data: {
        strategy: dto.strategy,
        config: dto.config as any,
        priority: dto.priority ?? 0,
        cadence: dto.cadence || null,
        isActive: dto.isActive ?? true,
        retailerId,
      },
    });
  }

  /**
   * Update an ingestion config
   */
  async update(id: string, dto: UpdateIngestionConfigDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.retailerIngestionConfig.update({
      where: { id },
      data: {
        strategy: dto.strategy,
        config: dto.config as any,
        priority: dto.priority,
        cadence: dto.cadence,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Delete an ingestion config
   */
  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.retailerIngestionConfig.delete({
      where: { id },
    });
  }

  /**
   * Manually trigger an ingestion run
   */
  async triggerIngestion(configId: string): Promise<IngestionResult> {
    const config = await this.findOne(configId);

    this.logger.log(`Triggering ingestion for config ${configId} (${config.strategy})`);

    try {
      // Get the strategy
      const strategy = this.strategyFactory.getStrategy(config.strategy);

      // Execute the strategy
      const result = await strategy.execute(config.config as any, config.retailerId);

      // Update health metrics
      await this.prisma.retailerIngestionConfig.update({
        where: { id: configId },
        data: {
          lastRun: new Date(),
          successCount: result.success ? { increment: 1 } : undefined,
          failureCount: result.success ? undefined : { increment: 1 },
        },
      });

      this.logger.log(
        `Ingestion completed for config ${configId}: ` +
        `${result.itemsIngested} items ingested, ` +
        `${result.errors.length} errors`
      );

      return result;
    } catch (error) {
      // Update failure count
      await this.prisma.retailerIngestionConfig.update({
        where: { id: configId },
        data: {
          lastRun: new Date(),
          failureCount: { increment: 1 },
        },
      });

      this.logger.error(`Ingestion failed for config ${configId}: ${error instanceof Error ? error.message : String(error)}`);

      throw error;
    }
  }
}
