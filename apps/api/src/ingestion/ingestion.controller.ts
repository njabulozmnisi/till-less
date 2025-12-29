import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateIngestionConfigDto, UpdateIngestionConfigDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('retailers/:retailerId/ingestion')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Get all ingestion configs for a retailer
   */
  @Get()
  findAll(@Param('retailerId') retailerId: string) {
    return this.ingestionService.findAllForRetailer(retailerId);
  }

  /**
   * Get a single ingestion config
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingestionService.findOne(id);
  }

  /**
   * Create a new ingestion config (admin only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(
    @Param('retailerId') retailerId: string,
    @Body() createIngestionConfigDto: CreateIngestionConfigDto
  ) {
    return this.ingestionService.create(retailerId, createIngestionConfigDto);
  }

  /**
   * Update an ingestion config (admin only)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateIngestionConfigDto: UpdateIngestionConfigDto
  ) {
    return this.ingestionService.update(id, updateIngestionConfigDto);
  }

  /**
   * Delete an ingestion config (admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ingestionService.remove(id);
  }

  /**
   * Manually trigger an ingestion run (admin only)
   */
  @Post(':id/trigger')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  trigger(@Param('id') id: string) {
    return this.ingestionService.triggerIngestion(id);
  }
}
