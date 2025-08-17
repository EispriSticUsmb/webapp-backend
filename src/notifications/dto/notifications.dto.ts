import { NotificationType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString({
    message: "L'utilisateur doit être une chaîne de caractères !",
  })
  @IsNotEmpty({
    message: "L'utilisateur ne peut pas être vide !",
  })
  userId: string;

  @IsOptional()
  @IsString({
    message:
      "L'identifiant de l'expéditeur doit être une chaîne de caractères !",
  })
  fromUserId?: string;

  @IsString({ message: 'Le message doit être une chaîne de caractères !' })
  @IsNotEmpty({ message: 'Le message est obligatoire !' })
  message: string;

  @IsOptional()
  @IsUrl({}, { message: 'Le lien doit être une URL valide !' })
  link?: string;

  @IsOptional()
  @IsEnum(NotificationType, {
    message: 'Le type de notification est invalide !',
  })
  type?: NotificationType = NotificationType.GENERAL;
}
