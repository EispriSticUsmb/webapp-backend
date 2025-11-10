import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { RedirectService } from './redirect.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { UserService } from 'src/user/user.service';
import { RedDto } from './dto/red.dto';

@Controller('redirect')
export class RedirectController {
  constructor(
    private readonly redService: RedirectService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(accessTokenAuthGuard)
  async getAllRed(@Request() request: RequestWithUser) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    return await this.redService.getAllRed();
  }

  @Get(':name')
  @Redirect()
  async redirect(@Param('name') name: string) {
    const target = (await this.redService.getRed(name)) || '/404';
    return { url: target, statusCode: 302 };
  }

  @Post(':name')
  @UseGuards(accessTokenAuthGuard)
  async createRed(
    @Param('name') name: string,
    @Request() request: RequestWithUser,
    @Body() body: RedDto,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    const target = await this.redService.getRed(name);
    if (target)
      throw new ConflictException('Une redirection porte déjà ce nom !');
    return await this.redService.createRed(name, body.target);
  }

  @Put(':name')
  @UseGuards(accessTokenAuthGuard)
  async updateRed(
    @Param('name') name: string,
    @Request() request: RequestWithUser,
    @Body() body: RedDto,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    const target = await this.redService.getRed(name);
    if (!target)
      throw new NotFoundException("Cette redirection n'existe pas !");
    return await this.redService.updateRed(name, body.target);
  }

  @Delete(':name')
  @UseGuards(accessTokenAuthGuard)
  async deleteRed(
    @Param('name') name: string,
    @Request() request: RequestWithUser,
  ) {
    if (!(await this.userService.isAdmin(request.user.userId))) {
      throw new ForbiddenException("Privilège d'administrateur requis");
    }
    const target = await this.redService.getRed(name);
    if (!target)
      throw new NotFoundException("Cette redirection n'existe pas !");
    return await this.redService.deleteRed(name);
  }
}
