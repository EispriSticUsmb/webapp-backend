import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CredentialsDto {
  @IsNotEmpty({ message: 'Identifiant requis' })
  identifier: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

export class resetDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}

export class passwordDto {
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(32, {
    message: 'Le mot de passe doit contenir au plus 32 caractères',
  })
  password: string;
}
