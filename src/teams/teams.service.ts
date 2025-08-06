import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
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
}
