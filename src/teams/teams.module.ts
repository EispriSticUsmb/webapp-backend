import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { InvitationsService } from 'src/invitations/invitations.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [TeamsController],
  providers: [
    TeamsService,
    PrismaService,
    UserService,
    EventsService,
    NotificationsService,
    InvitationsService,
  ],
  exports: [TeamsService],
  imports: [SocketModule],
})
export class TeamsModule {}
