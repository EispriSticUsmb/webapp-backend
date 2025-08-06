import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from 'src/types/user-payload.type';
import { registerCredentialsDto } from './dto/registerCredentials.dto';
import { CredentialsDto } from './dto/credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async login(authBody: CredentialsDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: authBody.identifier }, { username: authBody.identifier }],
      },
    });
    if (!existingUser) {
      throw new NotFoundException("L'utilisateur n'existe pas !");
    }

    const isPasswordSame = await this.isPasswordValid(
      authBody.password,
      existingUser.password,
    );

    if (!isPasswordSame) {
      throw new UnauthorizedException('Mot de passe incorrect !');
    }
    return {
      authtokens: this.authenticateUser({ userId: existingUser.id }),
      userId: existingUser.id,
    };
  }

  async register(authBody: registerCredentialsDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: authBody.username }, { email: authBody.email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === authBody.username) {
        throw new ConflictException("Nom d'utilisateur déjà utilisé");
      }
      if (existingUser.email === authBody.email) {
        throw new ConflictException('Email déjà utilisé');
      }
    }

    const hashedpassword = await this.hashPassword(authBody.password);

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: authBody.email,
          password: hashedpassword,
          username: authBody.username,
          firstName: authBody.firstName,
          lastName: authBody.lastName,
          role: 'USER',
          userType: authBody.userType,
        },
      });
      return {
        authtokens: this.authenticateUser({ userId: createdUser.id }),
        userId: createdUser.id,
      };
    } catch (_) {
      console.log(_);
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de la création de l'utilisateur",
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedpassword = await hash(password);
    return hashedpassword;
  }

  async isPasswordValid(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    const isPasswordValid = await verify(hashPassword, password);
    return isPasswordValid;
  }

  get_access_token(payLoad: UserPayload): { accessToken: string } {
    return {
      accessToken: this.jwtService.sign(payLoad, {
        secret: process.env.ACCESSTOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      }),
    };
  }

  private authenticateUser(payLoad: UserPayload): {
    refresh_token: string;
    access_token: string;
  } {
    return {
      refresh_token: this.jwtService.sign(payLoad, {
        secret: process.env.REFRESHTOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      }),
      access_token: this.jwtService.sign(payLoad, {
        secret: process.env.ACCESSTOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      }),
    };
  }
}
