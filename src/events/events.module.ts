import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { StorageService } from 'src/storage/storage.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService, PrismaService, UserService, StorageService],
  imports: [SocketModule],
  exports: [EventsService],
})
export class EventsModule {}
