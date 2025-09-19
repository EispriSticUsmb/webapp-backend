import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly notifService: NotificationsService,
  ) {}

  async doesTeamExist(id: string) {
    const team = await this.prisma.team.findUnique({
      where: {
        id,
      },
    });
    return team !== null;
  }

  async getTeamByEvent(eventId: string) {
    return await this.prisma.team.findMany({
      where: {
        eventId,
      },
      select: {
        id: true,
        name: true,
        eventId: true,
        leaderId: true,
        members: true,
        invitations: true,
      },
    });
  }

  async isLeaderTeam(teamId: string, userId: string): Promise<boolean> {
    const team = await this.getTeam(teamId);
    if (!team) return false;
    return team.leaderId === userId;
  }

  async isNameAlreadyExistInEvent(
    eventId: string,
    name: string,
  ): Promise<boolean> {
    const event = await this.prisma.team.findUnique({
      where: {
        name_eventId: {
          name,
          eventId,
        },
      },
    });
    return event !== null;
  }

  async getEventIdByTeamId(teamId: string): Promise<string> {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        eventId: true,
      },
    });
    if (!team)
      throw new InternalServerErrorException(
        "L'événement associé à cette équipe est introuvable !",
      );
    return team.eventId;
  }

  async ChangeTeamName(teamId: string, name: string) {
    if (!(await this.getTeam(teamId)))
      throw new NotFoundException("Cette équipe n'existe pas !");
    const eventId: string = await this.getEventIdByTeamId(teamId);
    if (await this.isNameAlreadyExistInEvent(eventId, name))
      throw new ConflictException("Ce nom d'équipe est déjà utilisé");
    return await this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
      },
    });
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (!(await this.getTeam(id)))
      throw new NotFoundException("Cette équipe n'existe pas !");

    await this.prisma.eventParticipant.deleteMany({
      where: { teamId: id },
    });
    const deleteTeam = await this.prisma.team.delete({
      where: {
        id,
      },
      include: { members: true, invitations: true },
    });
    return deleteTeam !== null;
  }

  async getTeam(id: string) {
    return await this.prisma.team.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        eventId: true,
        leaderId: true,
        createdAt: true,
        members: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
        invitations: {
          select: {
            invitedId: true,
            invitedById: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async updateLeaderTeam(teamId: string, newLeaderId: string) {
    if (!(await this.getTeam(teamId)))
      throw new BadRequestException("Cette équipe n'existe pas !");
    if (!(await this.userService.getUser(newLeaderId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    return await this.prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        leaderId: newLeaderId,
      },
    });
  }

  async isTeamFull(id: string): Promise<boolean> {
    const {
      event: { maxTeamSize },
      _count: { members },
    } = await this.prisma.team.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        event: {
          select: {
            maxTeamSize: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    return !!maxTeamSize && members >= maxTeamSize;
  }

  async deleteInvitationIfExist(userId: string, teamId: string) {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: {
        teamId_invitedId: {
          teamId,
          invitedId: userId,
        },
      },
    });
    if (invitation) {
      await this.prisma.teamInvitation.delete({
        where: {
          teamId_invitedId: {
            teamId,
            invitedId: userId,
          },
        },
      });
    }
  }

  async addUserInTeam(userId: string, teamId: string) {
    const team = await this.getTeam(teamId);
    if (!team) throw new BadRequestException("Cette équipe n'existe pas !");
    if (!(await this.userService.getUser(userId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    if (await this.isTeamFull(teamId))
      throw new ConflictException('Cette équipe est pleine !');
    await this.deleteInvitationIfExist(userId, teamId);
    return await this.prisma.eventParticipant.create({
      data: {
        userId,
        teamId,
        eventId: team.eventId,
      },
    });
  }

  async IsMemberOfTeam(userId: string, teamId: string): Promise<boolean> {
    if (!(await this.getTeam(teamId)))
      throw new BadRequestException("Cette équipe n'existe pas !");
    if (!(await this.userService.getUser(userId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    const participant = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_teamId: {
          teamId,
          userId,
        },
      },
    });
    return participant !== null;
  }

  async getTeamsInvitaion(teamId: string) {
    if (!(await this.getTeam(teamId)))
      throw new BadRequestException("Cette équipe n'existe pas !");
    return this.prisma.teamInvitation.findMany({
      where: {
        teamId,
      },
    });
  }

  async removeTeamMember(teamId: string, memberId: string, removerId?: string) {
    if (!(await this.IsMemberOfTeam(memberId, teamId)))
      throw new BadRequestException(
        'Cet utilisateur ne fait pas partie ce cette équipe !',
      );
    await this.notifService.createNotif({
      userId: memberId,
      fromUserId: removerId,
      type: 'TEAM_KICK',
      message: "Vous avez été expulsé d'une équipe",
      link: teamId,
    });
    await this.prisma.eventParticipant.delete({
      where: {
        userId_teamId: {
          teamId,
          userId: memberId,
        },
      },
    });
    return await this.getTeam(teamId);
  }
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
  async createTeamInvitationhandler(
    teamId: string,
    invitedId: string,
    invitedById: string,
  ) {
    if (!(await this.getTeam(teamId)))
      throw new BadRequestException("Cette équipe n'existe pas !");
    if (!(await this.userService.getUser(invitedId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    const eventId = await this.getEventIdByTeamId(teamId);
    return this.createTeamInvitation(teamId, eventId, invitedId, invitedById);
  }
}
