import { Module } from '@nestjs/common';
import { RetailerService } from './retailer.service';
import { RetailerController } from './retailer.controller';
import { PrismaModule } from '../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RetailerController],
  providers: [RetailerService],
  exports: [RetailerService],
})
export class RetailerModule {}
