import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto, LoginDto } from './dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    // Generate JWT token
    const token = await this.generateToken({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Validate user credentials
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = await this.generateToken({
      sub: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; name: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getUserById(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }

  private async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
