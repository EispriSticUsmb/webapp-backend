import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { answerDto } from './dto/answer.dto';
import { TeamsService } from 'src/teams/teams.service';
import { EventsService } from 'src/events/events.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamsService,
    private readonly eventService: EventsService,
    private readonly notifService: NotificationsService,
  ) {}
  async createTeamInvitation(
    teamId: string,
    eventId: string,
    invitedId: string,
    invitedById: string,
  ) {
    await this.notifService.createNotif({
      userId: invitedId,
      fromUserId: invitedById,
      type: 'TEAM_INVITATION',
      message: 'Vous avez été invité à rejoindre une équipe',
      link: teamId,
    });
    return this.prisma.teamInvitation.create({
      data: {
        teamId,
        eventId,
        invitedId,
        invitedById,
      },
    });
  }

  async getInvitation(id: string) {
    return await this.prisma.teamInvitation.findUnique({
      where: {
        id,
      },
    });
  }

  async DeleteInvitation(id: string) {
    return await this.prisma.teamInvitation.delete({
      where: {
        id,
      },
    });
  }

  async respondInvitation(id: string, body: answerDto) {
    const answer: boolean = body.answer;
    const invitation = await this.getInvitation(id);
    if (!invitation)
      throw new NotFoundException("Cette invitation n'existe pas !");
    if (await this.eventService.IsEventFull(invitation.eventId))
      throw new ConflictException("L'événement est plein");
    if (!(await this.eventService.IsInRegistrationPeriod(invitation.eventId)))
      throw new ConflictException(
        "Cet événement n'est pas en période d'inscription de nouveaux membres",
      );
    if (answer) {
      if (await this.teamService.isTeamFull(invitation.teamId))
        throw new ConflictException('Cette équipe est pleine !');
      await this.prisma.teamInvitation.delete({
        where: {
          id,
        },
      });
      await this.notifService.createNotif({
        userId: invitation.invitedById,
        fromUserId: invitation.invitedId,
        type: 'INVITATION_ACCEPTED',
        message: "l'invitation a été accepté",
        link: invitation.teamId,
      });
      return await this.teamService.addUserInTeam(
        invitation.invitedId,
        invitation.teamId,
      );
    } else {
      await this.notifService.createNotif({
        userId: invitation.invitedById,
        fromUserId: invitation.invitedId,
        type: 'INVITATION_DECLINED',
        message: "l'invitation a été refusé",
        link: invitation.teamId,
      });
      await this.prisma.teamInvitation.delete({
        where: {
          id,
        },
      });
    }
  }
}
