import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { accessTokenStrategy } from './accessToken.strategy';
import { refreshTokenStrategy } from './refreshToken.strategy';
import { UserService } from 'src/user/user.service';
import { UserType } from 'src/user/user.model';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    accessTokenStrategy,
    refreshTokenStrategy,
    UserService,
    EmailService,
  ],
  imports: [
    JwtModule.register({
      global: true,
    }),
  ],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const firstName = process.env.ADMIN_FIRSTNAME;
    const lastName = process.env.ADMIN_LASTNAME;
    const userTypeEnv = process.env.ADMIN_USERTYPE;
    if (email && username && password && firstName && lastName && userTypeEnv) {
      if (await this.authService.isAdminDefaultUserExist(username)) {
        this.logger.log('Administrateur par défaut disponible');
      } else {
        const userType = userTypeEnv as UserType;
        try {
          const AdminUser = await this.authService.register({
            email,
            username,
            password,
            firstName,
            lastName,
            userType,
          });
          await this.userService.setUserAdminRole(AdminUser.userId);
          this.logger.log('Administrateur par défaut créé');
        } catch (err) {
          this.logger.warn(
            "Echecs lors de la création de l'administrateur par défaut",
          );
          this.logger.warn(err);
        }
      }

      return;
    } else {
      this.logger.warn(
        "Les variables d'environnement de l'utilisateur par défaut ne sont pas correctes !",
      );
    }
  }
}
