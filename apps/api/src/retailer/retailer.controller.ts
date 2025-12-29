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
import { RetailerService } from './retailer.service';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('retailers')
export class RetailerController {
  constructor(private readonly retailerService: RetailerService) {}

  @Get()
  findAll() {
    return this.retailerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retailerService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createRetailerDto: CreateRetailerDto) {
    return this.retailerService.create(createRetailerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateRetailerDto: UpdateRetailerDto) {
    return this.retailerService.update(id, updateRetailerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.retailerService.remove(id);
  }
}
