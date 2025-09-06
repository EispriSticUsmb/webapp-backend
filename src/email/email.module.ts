import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp',
        port: 25,
        secure: false,
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService, PrismaService],
})
export class EmailModule {}
