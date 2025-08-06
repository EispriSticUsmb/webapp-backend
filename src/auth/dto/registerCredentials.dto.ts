import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserType } from 'src/user/user.model';

export class registerCredentialsDto {
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(64, {
    message: "L'Email doit contenir au plus 64 caractères",
  })
  email: string;

  @IsNotEmpty({ message: 'Username requis' })
  @MinLength(3, {
    message: "Le nom d'utilisateur doit contenir au moins 3 caractères",
  })
  @MaxLength(16, {
    message: "Le nom d'utilisateur doit contenir au plus 16 caractères",
  })
  @Matches(/^[^@]+$/, {
    message: 'Le caractère @ est interdit dans le pseudo !',
  })
  username: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(32, {
    message: 'Le mot de passe doit contenir au plus 32 caractères',
  })
  password: string;

  @IsString()
  @MaxLength(80, {
    message: 'Le prénom doit contenir au plus 80 caractères',
  })
  firstName: string;

  @IsString()
  @MaxLength(100, {
    message: 'Le nom de famille doit contenir au plus 100 caractères',
  })
  lastName: string;

  @IsNotEmpty({ message: "Le type d'utilisateur ne doit pas être vide !" })
  userType: UserType;
}
