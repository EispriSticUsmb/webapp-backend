import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class refreshTokenAuthGuard extends AuthGuard('refreshToken') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Access denied: invalid or expired token',
      );
    }
    return user;
  }
}
