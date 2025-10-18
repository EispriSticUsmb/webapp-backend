import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { CreateNotificationDto } from './dto/notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifService: NotificationsService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(accessTokenAuthGuard)
  async createNotif(
    @Request() request: RequestWithUser,
    @Body() body: CreateNotificationDto,
  ) {
    const userId = request.user.userId;
    if (!(await this.userService.isAdmin(userId)))
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.notifService.createNotif(body);
  }

  @Get(':id')
  @UseGuards(accessTokenAuthGuard)
  async getNotif(
    @Param('id') notifId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    const notif = await this.notifService.getNotif(notifId);
    if (notif.userId !== userId && !(await this.userService.isAdmin(userId)))
      throw new ForbiddenException("Privilège d'administrateur requis");
    return notif;
  }

  @Put(':id/read')
  @UseGuards(accessTokenAuthGuard)
  async markAdReadNotif(
    @Param('id') notifId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    const notif = await this.notifService.getNotif(notifId);
    if (notif.userId !== userId && !(await this.userService.isAdmin(userId)))
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.notifService.markNotifAsRead(notifId);
  }

  @Delete(':id')
  @UseGuards(accessTokenAuthGuard)
  async removeNotif(
    @Param('id') notifId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    const notif = await this.notifService.getNotif(notifId);
    if (notif.userId !== userId && !(await this.userService.isAdmin(userId)))
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.notifService.deleteNotif(notifId);
  }
}
