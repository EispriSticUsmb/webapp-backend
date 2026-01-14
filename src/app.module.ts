import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InvitationsModule } from './invitations/invitations.module';
import { TeamsModule } from './teams/teams.module';
import { EventsModule } from './events/events.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { RedirectModule } from './redirect/redirect.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    SocketModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
    TeamsModule,
    InvitationsModule,
    NotificationsModule,
    StorageModule,
    EmailModule,
    RedirectModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 3,
          limit: 1,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
