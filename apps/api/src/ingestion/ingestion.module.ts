import { Module, OnModuleInit } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { StrategyFactoryService } from './strategy-factory.service';
import { ScraperStrategy } from './strategies';
import { PrismaModule } from '../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    StrategyFactoryService,
    ScraperStrategy,
  ],
  exports: [IngestionService, StrategyFactoryService],
})
export class IngestionModule implements OnModuleInit {
  constructor(
    private readonly strategyFactory: StrategyFactoryService,
    private readonly scraperStrategy: ScraperStrategy
  ) {}

  /**
   * Register strategies on module initialization
   */
  onModuleInit() {
    this.strategyFactory.registerStrategy(this.scraperStrategy);
  }
}
