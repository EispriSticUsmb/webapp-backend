import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { StorageService } from 'src/storage/storage.service';
import { TeamsService } from 'src/teams/teams.service';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    PrismaService,
    UserService,
    StorageService,
    TeamsService,
  ],
})
export class EventsModule {}
