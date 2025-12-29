import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { UpdateRetailerDto } from './dto/update-retailer.dto';

@Injectable()
export class RetailerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.retailer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const retailer = await this.prisma.retailer.findUnique({
      where: { id },
    });

    if (!retailer) {
      throw new NotFoundException(`Retailer with ID ${id} not found`);
    }

    return retailer;
  }

  async create(createRetailerDto: CreateRetailerDto) {
    return this.prisma.retailer.create({
      data: createRetailerDto,
    });
  }

  async update(id: string, updateRetailerDto: UpdateRetailerDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.retailer.update({
      where: { id },
      data: updateRetailerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    // Soft delete: set isActive to false
    return this.prisma.retailer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
