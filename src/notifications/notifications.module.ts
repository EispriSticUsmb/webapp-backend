import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, UserService],
  imports: [SocketModule],
})
export class NotificationsModule {}
