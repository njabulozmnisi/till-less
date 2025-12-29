import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../common/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HealthModule } from '../health/health.module';
import { RetailerModule } from '../retailer/retailer.module';

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, RetailerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
