import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(ValidationPipe) dto: RegisterDto
  ): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(): Promise<{ message: string }> {
    // For JWT, logout is handled client-side by removing the token
    // This endpoint can be used for cleanup if needed (e.g., refresh tokens in future)
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: { user: { id: string; email: string; name: string } }
  ): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
    };
  }> {
    return { user: req.user };
  }
}
