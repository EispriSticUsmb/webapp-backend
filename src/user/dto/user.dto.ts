import { IsNotEmpty } from 'class-validator';

export class userIdDto {
  @IsNotEmpty({ message: "L'id de l'utilisateur est requis" })
  userId: string;
}
