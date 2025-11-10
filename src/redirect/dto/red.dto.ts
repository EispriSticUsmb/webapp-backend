import { IsString, IsNotEmpty } from 'class-validator';

export class RedDto {
  @IsString({
    message: 'Le lien dois être une chaine de caractère!',
  })
  @IsNotEmpty({
    message: 'Vous devez indiquer un lien de redirection!',
  })
  target: string;
}
