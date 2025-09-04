import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class EventContentDto {
  @IsNotEmpty({ message: 'Le titre est requis !' })
  @MaxLength(128, {
    message: 'Le titre ne doit pas dépasser 128 caractères !',
  })
  title: string;

  @IsOptional()
  @MaxLength(512, {
    message: 'Le sous-titre ne doit pas dépasser 512 caractères !',
  })
  descriptionSummary?: string;

  @IsNotEmpty({ message: 'La description est requise !' })
  @MaxLength(16384, {
    message: 'La description ne doit pas dépasser 16 384 caractères !',
  })
  description: string;

  @IsOptional()
  @MaxLength(256, {
    message: 'Le lieu ne doit pas dépasser 256 caractères !',
  })
  location?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La date de début doit être une date valide !' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit être une date valide !' })
  endDate?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: "La date de début d'inscription doit être une date valide !" },
  )
  registrationStart?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: "La date de fin d'inscription doit être une date valide !" },
  )
  registrationEnd?: string;

  @IsOptional()
  @IsInt({ message: 'Le nombre maximum de participants doit être un entier !' })
  @Min(1, { message: 'Il doit y avoir au moins un participant !' })
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean({ message: 'Le champ "allowTeams" doit être un booléen !' })
  allowTeams?: boolean;

  @IsOptional()
  @IsInt({ message: "La taille maximale d'une équipe doit être un entier !" })
  @Min(1, { message: 'Une équipe doit avoir au moins 1 membre. !' })
  @Max(100, { message: 'Une équipe ne doit pas dépasser 100 membres !' })
  maxTeamSize?: number;

  @IsOptional()
  @IsUrl({}, { message: 'Le lien externe doit être une URL valide !' })
  externalLink?: string;
}
