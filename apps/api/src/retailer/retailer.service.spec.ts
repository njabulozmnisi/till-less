import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RetailerService } from './retailer.service';
import { PrismaService } from '../common/prisma.service';

describe('RetailerService', () => {
  let service: RetailerService;
  let prisma: PrismaService;

  const mockPrismaService = {
    retailer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockRetailer = {
    id: '1',
    slug: 'checkers',
    name: 'Checkers',
    displayName: 'Checkers Sixty60',
    isActive: true,
    isVisible: true,
    logoUrl: '/logos/checkers.svg',
    brandColor: '#00A859',
    websiteUrl: 'https://www.checkers.co.za',
    supportEmail: 'support@checkers.co.za',
    supportPhone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetailerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RetailerService>(RetailerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of retailers', async () => {
      const retailers = [mockRetailer];
      mockPrismaService.retailer.findMany.mockResolvedValue(retailers);

      const result = await service.findAll();

      expect(result).toEqual(retailers);
      expect(prisma.retailer.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no retailers exist', async () => {
      mockPrismaService.retailer.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a retailer by id', async () => {
      mockPrismaService.retailer.findUnique.mockResolvedValue(mockRetailer);

      const result = await service.findOne('1');

      expect(result).toEqual(mockRetailer);
      expect(prisma.retailer.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when retailer not found', async () => {
      mockPrismaService.retailer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow(
        'Retailer with ID 999 not found'
      );
    });
  });

  describe('create', () => {
    it('should create a new retailer', async () => {
      const createDto = {
        slug: 'checkers',
        name: 'Checkers',
        displayName: 'Checkers Sixty60',
      };
      mockPrismaService.retailer.create.mockResolvedValue(mockRetailer);

      const result = await service.create(createDto);

      expect(result).toEqual(mockRetailer);
      expect(prisma.retailer.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update an existing retailer', async () => {
      const updateDto = { name: 'Updated Checkers' };
      const updatedRetailer = { ...mockRetailer, name: 'Updated Checkers' };

      mockPrismaService.retailer.findUnique.mockResolvedValue(mockRetailer);
      mockPrismaService.retailer.update.mockResolvedValue(updatedRetailer);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedRetailer);
      expect(prisma.retailer.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent retailer', async () => {
      mockPrismaService.retailer.findUnique.mockResolvedValue(null);

      await expect(service.update('999', { name: 'Test' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a retailer by setting isActive to false', async () => {
      const softDeletedRetailer = { ...mockRetailer, isActive: false };

      mockPrismaService.retailer.findUnique.mockResolvedValue(mockRetailer);
      mockPrismaService.retailer.update.mockResolvedValue(softDeletedRetailer);

      const result = await service.remove('1');

      expect(result).toEqual(softDeletedRetailer);
      expect(prisma.retailer.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when removing non-existent retailer', async () => {
      mockPrismaService.retailer.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
