import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  async sendResetPasswordEmail(email: string, token: string) {
    console.log('je rentre bien dans ma fonction');
    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail)
      throw new InternalServerErrorException('Erreur interne du serveur');
    await this.mailerService.sendMail({
      to: email,
      from: fromEmail,
      subject: 'Réinitialisation du mot de passe Eispri Stic',
      template: './reset-password',
      context: {
        DOMAIN: process.env.DOMAIN_NAME ?? '',
        TOKEN: token,
      },
      text:
        'Bonjour,\n\nNous avons reçu une demande de réinitialisation pour votre compte.\n\nPour choisir un nouveau mot de passe, cliquez sur ce lien :\nhttps://' +
        (process.env.DOMAIN_NAME ?? '') +
        '/reset?token=' +
        token +
        "\n\nCe lien expirera dans 60 minutes et ne peut être utilisé qu'une seule fois.\n\nSi vous n'avez pas demandé cette opération, ignorez cet e-mail.\n\n— L'équipe Eispri Stic",
    });
  }
}
