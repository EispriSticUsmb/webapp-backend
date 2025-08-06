import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { accessTokenStrategy } from './accessToken.strategy';
import { refreshTokenStrategy } from './refreshToken.strategy';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    accessTokenStrategy,
    refreshTokenStrategy,
    UserService,
  ],
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AuthModule {}
