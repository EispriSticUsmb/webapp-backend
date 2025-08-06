import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserPayload } from 'src/types/user-payload.type';
import { Request } from 'express';

@Injectable()
export class refreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor() {
    const secret = process.env.REFRESHTOKEN_SECRET;
    if (!secret) {
      throw new Error('REFRESHTOKEN_SECRET must be defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([<JwtFromRequestFunction>((
          req: Request,
        ) => {
          const cookieName =
            process.env.REFRESHTOKEN_COOKIE_NAME || 'refresh_token';
          const headerName = 'x-refresh-token';

          const tokenFromCookie = (req?.cookies?.[cookieName] ?? null) as
            | string
            | null;
          if (tokenFromCookie) {
            return tokenFromCookie;
          }

          const tokenFromHeader = (req.headers?.[headerName] ?? null) as
            | string
            | null;
          return tokenFromHeader;
        })]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate({ userId }: UserPayload) {
    return { userId };
  }
}
