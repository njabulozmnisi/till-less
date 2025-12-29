import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      const hashedPassword = 'hashedPassword';
      const user = { id: '1', email: dto.email, name: dto.name, passwordHash: hashedPassword };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.token).toBe('token');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const user = { id: '1', email: dto.email, name: 'Test', passwordHash: 'hashed' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('token');

      const result = await service.login(dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(result.token).toBe('token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: '1', email, name: 'Test', passwordHash: 'hashed' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual({ id: user.id, email: user.email, name: user.name });
    });

    it('should return null for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = { id: '1', email, name: 'Test', passwordHash: 'hashed' };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });
});
