import { IsBoolean, IsNotEmpty } from 'class-validator';

export class answerDto {
  @IsBoolean({
    message: 'La réponse doit être un booléen !',
  })
  @IsNotEmpty({
    message: "Vous devez indiquer une réponse à l'invitation!",
  })
  answer: boolean;
}
