import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async markNotifAsRead(notifId: string) {
    return await this.prisma.notification.update({
      where: {
        id: notifId,
      },
      data: {
        isRead: true,
      },
    });
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
    return await this.prisma.notification.delete({
      where: {
        id: notifId,
      },
    });
  }

  async createNotif(data: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data,
    });
  }
}
