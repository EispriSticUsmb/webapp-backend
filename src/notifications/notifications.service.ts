import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socket: SocketService,
  ) {}

  async markNotifAsRead(notifId: string) {
    const notif = await this.prisma.notification.update({
      where: {
        id: notifId,
      },
      data: {
        isRead: true,
      },
    });
    this.socket.sendWsEvent('users/' + notif.userId, undefined);
    return notif;
  }
  async getNotif(id: string) {
    const notif = await this.prisma.notification.findUnique({
      where: {
        id,
      },
    });
    if (!notif)
      throw new NotFoundException("Cette notification est n'existe pas !");
    return notif;
  }

  async deleteNotif(notifId: string) {
    const notif = await this.prisma.notification.delete({
      where: {
        id: notifId,
      },
    });
    this.socket.sendWsEvent('users/' + notif.userId, undefined);
    return notif;
  }

  async createNotif(data: CreateNotificationDto) {
    const notif = await this.prisma.notification.create({
      data,
    });
    this.socket.sendWsEvent('users/' + notif.userId, undefined);
    return notif;
  }
}
