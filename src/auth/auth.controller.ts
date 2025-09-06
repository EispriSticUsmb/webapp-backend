import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { refreshTokenAuthGuard } from './refreshToken.auth.guard';
import { CredentialsDto, passwordDto, resetDto } from './dto/credentials.dto';
import { registerCredentialsDto } from './dto/registerCredentials.dto';
import { MailTokenAuthGuard } from './mail.auth.gard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  async login(
    @Body() authBody: CredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { authtokens, userId } = await this.authService.login(authBody);
    response.cookie(
      process.env.REFRESHTOKEN_COOKIE_NAME || 'refresh_token',
      authtokens.refresh_token,
      {
        httpOnly: true,
        secure: process.env.PRODUCTION === 'true',
        sameSite: 'strict',
        maxAge:
          1000 *
          (parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '604800', 10) ||
            604800), // 1 jour en millisecondes
        path: '/',
      },
    );
    return {
      access_token: authtokens.access_token,
      user: await this.userService.getUser(userId),
    };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(process.env.REFRESHTOKEN_COOKIE_NAME || 'refresh_token', {
      httpOnly: true,
      secure: process.env.PRODUCTION === 'true',
      sameSite: 'strict',
      path: '/',
    });
  }

  @Post('register')
  async register(
    @Body() authBody: registerCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { authtokens, userId } = await this.authService.register(authBody);
    response.cookie(
      process.env.REFRESHTOKEN_COOKIE_NAME || 'refresh_token',
      authtokens.refresh_token,
      {
        httpOnly: true,
        secure: process.env.PRODUCTION === 'true',
        sameSite: 'strict',
        maxAge:
          1000 *
          (parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '604800', 10) ||
            604800), // 1 jour en millisecondes
        path: '/',
      },
    );
    return {
      access_token: authtokens.access_token,
      user: await this.userService.getUser(userId),
    };
  }

  @UseGuards(refreshTokenAuthGuard)
  @Post('refresh')
  async refresh(@Request() request: RequestWithUser) {
    const { accessToken } = this.authService.get_access_token(request.user);
    return {
      accessToken,
      user: await this.userService.getUser(request.user.userId),
    };
  }

  @Post('sendmail')
  @HttpCode(204)
  async sendResetMail(@Body() body: resetDto) {
    await this.authService.sendResetPasswordMail(body.email);
  }

  @Post('reset')
  @HttpCode(204)
  @UseGuards(MailTokenAuthGuard)
  async resetPassword(
    @Body() body: passwordDto,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    await this.authService.resetPassword(userId, body.password);
  }
}
