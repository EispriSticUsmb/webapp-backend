import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PartialUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(64, {
    message: "L'Email doit contenir au plus 64 caractères",
  })
  email?: string;

  @IsOptional()
  @MinLength(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
  })
  @MaxLength(16, {
    message: "Le nom d'utilisateur doit contenir au plus 16 caractères",
  })
  @Matches(/^[^@]+$/, {
    message: 'Le caractère @ est interdit dans le pseudo !',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, {
    message: 'Le prénom doit contenir au plus 80 caractères',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Le nom de famille doit contenir au plus 100 caractères',
  })
  lastName?: string;

  @IsOptional()
  userType?: UserType;
}
