import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { EventContentDto } from './dto/eventContent.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';
import { memoryStorage } from 'multer';
import { NameTeamDto } from 'src/teams/dto/team.dto';
import { userIdDto } from 'src/user/dto/user.dto';
import { Response } from 'express';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly userService: UserService,
    private readonly storageService: StorageService,
  ) {}
  @Get()
  async getEvents() {
    return await this.eventsService.getEvents();
  }

  @Post()
  @UseGuards(accessTokenAuthGuard)
  async createEvent(
    @Request() request: RequestWithUser,
    @Body() body: EventContentDto,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.eventsService.createEvent(body);
  }

  @Get(':eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return await this.eventsService.getEvent(eventId);
  }

  @Put(':eventId')
  @UseGuards(accessTokenAuthGuard)
  async updateEvent(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
    @Body() body: EventContentDto,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.eventsService.updateEvent(eventId, body);
  }

  @Get(':eventId/eventImage')
  async getUserProfileImage(
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ) {
    const hypotheticalpath =
      await this.storageService.getEventImagePath(eventId);
    if (!hypotheticalpath) return res.status(404).end();
    const { path, mimeType } = hypotheticalpath;
    res.setHeader('Content-Type', mimeType);
    return res.sendFile(path);
  }

  @Put(':eventId/eventImage')
  @UseGuards(accessTokenAuthGuard)
  @UseInterceptors(
    FileInterceptor('eventImage', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async updateEventImage(
    @Request() request: RequestWithUser,
    @Param('eventId') eventId: string,
    @UploadedFile() eventImage: Express.Multer.File,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    if (!(await this.eventsService.getEvent(eventId)))
      throw new NotFoundException("L'événement n'existe pas !");
    await this.storageService.changeEventImage(eventId, eventImage);
  }

  @Delete(':eventId')
  @UseGuards(accessTokenAuthGuard)
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    await this.eventsService.deleteEvent(eventId);
    await this.storageService.deleteFile('events' + eventId);
  }

  @Get(':eventId/participants')
  @UseGuards(accessTokenAuthGuard)
  async getEventParticipants(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.eventsService.getEventParticipants(eventId);
  }

  @Post(':eventId/participants')
  @UseGuards(accessTokenAuthGuard)
  async addParticipantEvent(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
    @Body() body: userIdDto,
  ) {
    const userId: string = body.userId;
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF')
      throw new ForbiddenException("Privilège d'administrateur requis");
    await this.eventsService.addEventParticipantWithoutTeam(
      eventId,
      userId,
      role === 'ADMIN',
    );
  }

  @Delete(':eventId/participants')
  @UseGuards(accessTokenAuthGuard)
  async removeParticipantEvent(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
    @Body() body: userIdDto,
  ) {
    const userId: string = body.userId;
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF')
      throw new ForbiddenException("Privilège d'administrateur requis");
    await this.eventsService.deleteParticipantWithoutTeam(eventId, userId);
  }

  @Get(':eventId/teams')
  async getEventTeams(@Param('eventId') eventId: string) {
    return await this.eventsService.getEventTeam(eventId);
  }

  @Post(':eventId/teams')
  @UseGuards(accessTokenAuthGuard)
  createTeamEvent(
    @Param('eventId') eventId: string,
    @Request() request: RequestWithUser,
    @Body() body: NameTeamDto,
  ) {
    return this.eventsService.createTeam(
      eventId,
      request.user.userId,
      body.name,
    );
  }
}
