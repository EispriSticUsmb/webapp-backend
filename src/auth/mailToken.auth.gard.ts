import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MailTokenAuthGuard extends AuthGuard('mailToken') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Access denied: invalid or expired token',
      );
    }
    return user;
  }
}
