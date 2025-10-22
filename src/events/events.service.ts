import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EventContentDto } from './dto/eventContent.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getEvents() {
    const events = await this.prisma.event.findMany({
      select: {
        id: true,
        title: true,
        descriptionSummary: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        registrationStart: true,
        registrationEnd: true,
        maxParticipants: true,
        allowTeams: true,
        maxTeamSize: true,
        externalLink: true,
        teams: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    const formattedEvents = events.map(({ _count, ...event }) => ({
      ...event,
      currentParticipants: _count.participants,
    }));
    return formattedEvents;
  }

  async getEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        descriptionSummary: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        registrationStart: true,
        registrationEnd: true,
        maxParticipants: true,
        allowTeams: true,
        maxTeamSize: true,
        externalLink: true,
        teams: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }
    const { _count, ...rest } = event;
    return {
      ...rest,
      currentParticipants: _count.participants,
    };
  }
  async createEvent(data: EventContentDto) {
    const event = await this.prisma.event.create({
      data,
    });
    if (event) return event;
    throw new InternalServerErrorException(
      "Echec lors de La création de l'événement !",
    );
  }

  async IsUserInEvent(eventId: string, userId: string): Promise<boolean> {
    const participants = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
      },
    });
    if (!participants) return false;
    return true;
  }

  async deleteParticipantWithoutTeam(eventId: string, userId: string) {
    if (!(await this.getEvent(eventId)))
      throw new NotFoundException("Cet événement n'existe pas !");
    if (!(await this.userService.getUser(userId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    if (!(await this.IsUserInEvent(eventId, userId)))
      throw new BadRequestException(
        'Cet utilisateur ne participe pas à cet événement !',
      );
    if (await this.IsEventAllowingTeams(eventId))
      throw new BadRequestException(
        "Pour supprimer cet utilisateur de l'événement, il faut le retirer de l'équipe.",
      );
    return await this.prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
      },
    });
  }

  async IsEventAllowingTeams(eventId: string): Promise<boolean> {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        allowTeams: true,
      },
    });
    if (!event) return false;
    return event.allowTeams;
  }

  async IsUserAlreadyInEvent(
    eventId: string,
    userId: string,
  ): Promise<boolean> {
    const participants = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          eventId,
          userId,
        },
      },
    });
    return participants !== null;
  }

  async IsInRegistrationPeriod(eventId: string): Promise<boolean> {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {
        id: eventId,
      },
      select: {
        registrationStart: true,
        registrationEnd: true,
      },
    });

    if (!event.registrationStart || !event.registrationEnd) {
      return false;
    }

    const now = new Date();
    return now >= event.registrationStart && now <= event.registrationEnd;
  }

  async IsEventFull(eventId: string): Promise<boolean> {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {
        id: eventId,
      },
      select: {
        maxParticipants: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
    if (!event.maxParticipants) return false;
    return event._count.participants >= event.maxParticipants;
  }

  async addEventParticipantWithoutTeam(
    eventId: string,
    userId: string,
    PutByAdmin: boolean = false,
  ) {
    if (!(await this.getEvent(eventId)))
      throw new NotFoundException("Cet événement n'existe pas !");
    if (!(await this.userService.getUser(userId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    if (await this.IsEventFull(eventId))
      throw new ConflictException('Cet événement est déjà complet !');
    if (!PutByAdmin && !(await this.IsInRegistrationPeriod(eventId)))
      throw new ConflictException(
        "Cet événement n'est pas en période d'inscription de nouveaux membres",
      );
    if (await this.IsEventAllowingTeams(eventId))
      throw new BadRequestException(
        'Pour participer à cet événement, il faut rejoindre ou créer une équipe !',
      );
    if (await this.IsUserAlreadyInEvent(eventId, userId))
      throw new ConflictException(
        "Cet utilisateur est déjà inscrit à l'événement !",
      );
    return await this.prisma.eventParticipant.create({
      data: {
        userId,
        eventId,
      },
    });
  }

  async getEventParticipants(eventId: string) {
    const event = await this.prisma.eventParticipant.findMany({
      where: {
        eventId,
      },
      select: {
        id: true,
        eventId: true,
        userId: true,
        teamId: true,
        createdAt: true,
      },
    });
    return event;
  }

  async updateEvent(id: string, data: EventContentDto) {
    if (!(await this.getEvent(id)))
      throw new NotFoundException('Événement introuvable');
    const updatedEvent = await this.prisma.event.update({
      where: {
        id,
      },
      data,
    });
    if (!updatedEvent)
      throw new InternalServerErrorException(
        "Echec lors de la mise à jour de l'événement !",
      );
    return await this.getEvent(id);
  }

  async deleteEvent(id: string) {
    if (!(await this.getEvent(id)))
      throw new NotFoundException('Événement introuvable');
    await this.prisma.event.delete({
      where: {
        id,
      },
    });
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

  async getEventTeam(eventId: string) {
    if (!(await this.IsEventAllowingTeams(eventId)))
      throw new BadRequestException(
        "Cet événement ne peut pas avoir d'équipe !",
      );
    return await this.getTeamByEvent(eventId);
  }

  private async isUserInEvent(
    userId: string,
    eventId: string,
  ): Promise<boolean> {
    const participants = await this.prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
    return participants !== null;
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
  async createTeam(eventId: string, leaderId: string, name: string) {
    if (!(await this.getEvent(eventId)))
      throw new BadRequestException("Cet événement n'existe pas !");
    if (!(await this.userService.getUserLite(leaderId)))
      throw new BadRequestException("Cet utilisateur n'existe pas !");
    if (!(await this.IsInRegistrationPeriod(eventId)))
      throw new ConflictException(
        "Cet événement n'est pas en période d'inscription de nouveaux membres",
      );
    if (!(await this.IsEventAllowingTeams(eventId)))
      throw new BadRequestException(
        "Cet événement ne peut pas avoir d'équipe !",
      );
    if (await this.isUserInEvent(leaderId, eventId))
      throw new ConflictException('Cet utilisateur est déjà dans une équipe !');
    if (await this.isNameAlreadyExistInEvent(eventId, name))
      throw new ConflictException("Ce nom d'équipe est déjà utilisé");
    return await this.prisma.team.create({
      data: {
        name,
        eventId,
        leaderId,
        members: {
          create: {
            userId: leaderId,
            eventId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }
}
