import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserPayload } from 'src/types/user-payload.type';

@Injectable()
export class accessTokenStrategy extends PassportStrategy(
  Strategy,
  'mailToken',
) {
  constructor() {
    const secret = process.env.MAIL_SECRET;
    if (!secret) {
      throw new Error('MAIL_SECRET must be defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate({ userId }: UserPayload) {
    return { userId };
  }
}
