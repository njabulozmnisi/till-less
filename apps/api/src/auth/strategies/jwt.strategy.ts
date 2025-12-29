import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['BETTER_AUTH_SECRET'] || 'development-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; name: string }> {
    const user = await this.authService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
