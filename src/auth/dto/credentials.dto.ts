import { IsNotEmpty } from 'class-validator';

export class CredentialsDto {
  @IsNotEmpty({ message: 'Identifiant requis' })
  identifier: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}
