import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class NameTeamDto {
  @IsNotEmpty({ message: "Le nom de l'équipe est requis !" })
  @MinLength(1, {
    message: "Le nom de l'équipe doit faire au moins 1 caractère !",
  })
  @MaxLength(64, {
    message: "Le nom de l'équipe ne doit pas dépasser 64 caractères !",
  })
  name: string;
}

export class leaderIdDto {
  @IsNotEmpty({ message: "L'id du nouveau chef d'équipe est requis" })
  leaderId: string;
}
