import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { RequestWithUser } from 'src/types/user-payload.type';
import { PaginationQueryDto } from 'src/share/dto/pagination-query.dto';
import { accessTokenOptionalAuthGuard } from 'src/auth/accessToken.auth.optional.guard';
import { PartialUserDto } from 'src/share/dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { userRenewPasswordDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly storageService: StorageService,
  ) {}

  @Get('')
  @UseGuards(accessTokenAuthGuard)
  async getUsers(
    @Query() pagination: PaginationQueryDto,
    @Request() request: RequestWithUser,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.getUsers(pagination);
  }

  @UseGuards(accessTokenAuthGuard)
  @Get('me')
  getMyUser(@Request() request: RequestWithUser) {
    return this.userService.getUser(request.user.userId);
  }

  @UseGuards(accessTokenOptionalAuthGuard)
  @Get(':userId')
  async getUser(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
  ) {
    switch (await this.userService.role(request.user, userId)) {
      case 'ADMIN':
        return this.userService.getUser(userId);
        break;
      case 'SELF':
        return this.userService.getUser(userId);
        break;
      default:
        return this.userService.getUserLite(userId);
    }
  }

  @Patch(':userId')
  @UseGuards(accessTokenAuthGuard)
  async updateUser(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
    @Body() updateDataBody: PartialUserDto,
  ) {
    switch (await this.userService.role(request.user, userId)) {
      case 'ADMIN':
        return await this.userService.updateUser(userId, updateDataBody);
        break;
      case 'SELF':
        return await this.userService.updateUser(userId, updateDataBody);
        break;
      default:
        throw new ForbiddenException("Privilège d'administrateur requis");
    }
  }

  @UseGuards(accessTokenAuthGuard)
  @Delete(':userId')
  async DeleteUser(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
    @Body() Body?: { password?: string },
  ): Promise<void> {
    switch (await this.userService.role(request.user, userId)) {
      case 'ADMIN':
        await this.userService.deleteUser(userId);
        break;
      case 'SELF':
        if (
          !(
            Body?.password &&
            (await this.userService.ValidUserPassword(userId, Body.password))
          )
        )
          throw new ForbiddenException('Mot de passe incorrect');
        await this.userService.deleteUser(userId);
        break;
      default:
        throw new ForbiddenException("Privilège d'administrateur requis");
    }
  }

  @Get(':userId/profileImage')
  async getUserProfileImage(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const hypotheticalpath =
      await this.storageService.getUserProfileImagePath(userId);
    if (!hypotheticalpath) return res.status(404).end();
    const { path, mimeType } = hypotheticalpath;
    res.setHeader('Content-Type', mimeType);
    return res.sendFile(path);
  }

  @Put(':userId/profileImage')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @UseGuards(accessTokenAuthGuard)
  async updateProfilePicture(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF') {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    await this.storageService.changeProfileImage(userId, profileImage);
  }

  @Get(':userId/events')
  @UseGuards(accessTokenAuthGuard)
  async getUsersEvent(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
  ) {
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF') {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.getUsersEvent(userId);
  }

  @Get(':userId/notifications')
  @UseGuards(accessTokenAuthGuard)
  async getUsersNotif(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
  ) {
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF') {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.getUsersNotif(userId);
  }

  @Get(':userId/receivedInvitations')
  @UseGuards(accessTokenAuthGuard)
  async getUsersReceivedInvitations(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
  ) {
    const role = await this.userService.role(request.user, userId);
    if (role !== 'ADMIN' && role !== 'SELF') {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.getUsersReceivedInvitations(userId);
  }

  @Put(':userId/password')
  @UseGuards(accessTokenAuthGuard)
  async changePassword(
    @Param('userId') userId: string,
    @Request() request: RequestWithUser,
    @Body() body: userRenewPasswordDto,
  ) {
    const role = await this.userService.role(request.user, userId);
    if (role === 'SELF') {
      if (
        !body.oldPassword ||
        !(await this.userService.ValidUserPassword(userId, body.oldPassword))
      ) {
        throw new ForbiddenException('Mot de passe actuel incorrect !');
      }
    } else if (role !== 'ADMIN') {
      throw new ForbiddenException("Privilège d'administrateur requis !");
    }
    await this.userService.changeUserPassword(userId, body.newPassword);
  }

  @Put(':userId/role/admin')
  @UseGuards(accessTokenAuthGuard)
  async setUserAdminRole(
    @Request() request: RequestWithUser,
    @Param('userId') userId: string,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.setUserAdminRole(userId);
  }

  @Put(':userId/role/membre')
  @UseGuards(accessTokenAuthGuard)
  async setUserMemberRole(
    @Request() request: RequestWithUser,
    @Param('userId') userId: string,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.setUserMemberRole(userId);
  }

  @Put(':userId/role/user')
  @UseGuards(accessTokenAuthGuard)
  async setUserUserRole(
    @Request() request: RequestWithUser,
    @Param('userId') userId: string,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.userService.setUserUserRole(userId);
  }
}
