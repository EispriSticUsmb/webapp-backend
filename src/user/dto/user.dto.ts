import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class userIdDto {
  @IsNotEmpty({ message: "L'id de l'utilisateur est requis" })
  @IsString()
  userId: string;
}

export class identifierDto {
  @IsNotEmpty({ message: 'Identifiant requis' })
  @IsString()
  identifier: string;
}

export class userRenewPasswordDto {
  @IsOptional()
  oldPassword: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(32, {
    message: 'Le nouveau mot de passe doit contenir au maximum 32 caractères',
  })
  @IsString()
  newPassword: string;
}
