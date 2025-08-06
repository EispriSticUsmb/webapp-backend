import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { StorageService } from 'src/storage/storage.service';

@Module({
  providers: [UserService, PrismaService, StorageService],
  controllers: [UserController],
})
export class UserModule {}
