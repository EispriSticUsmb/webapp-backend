import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { TeamsService } from 'src/teams/teams.service';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    PrismaService,
    UserService,
    TeamsService,
    EventsService,
    NotificationsService,
  ],
  exports: [InvitationsService],
})
export class InvitationsModule {}
