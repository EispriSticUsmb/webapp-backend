import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { InvitationsService } from './invitations.service';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { answerDto } from './dto/answer.dto';
import { TeamsService } from 'src/teams/teams.service';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationService: InvitationsService,
    private readonly userService: UserService,
    private readonly teamService: TeamsService,
  ) {}

  @Get(':id')
  @UseGuards(accessTokenAuthGuard)
  async getInvitations(
    @Param('id') invitationsId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    const invitations =
      await this.invitationService.getInvitation(invitationsId);
    if (!invitations)
      throw new NotFoundException("Cette invitation n'existe pas !");
    if (
      userId !== invitations.invitedId &&
      !(await this.teamService.IsMemberOfTeam(userId, invitations.teamId)) &&
      !(await this.userService.isAdmin(userId))
    )
      throw new ForbiddenException("Privilège d'administrateur requis");
    return invitations;
  }

  @Post(':id/respond')
  @UseGuards(accessTokenAuthGuard)
  async respondInvitation(
    @Param('id') invitationsId: string,
    @Request() request: RequestWithUser,
    @Body() body: answerDto,
  ) {
    const userId = request.user.userId;
    const invitations =
      await this.invitationService.getInvitation(invitationsId);
    if (!invitations)
      throw new NotFoundException("Cette invitation n'existe pas !");
    if (
      userId !== invitations.invitedId &&
      !(await this.userService.isAdmin(userId))
    )
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.invitationService.respondInvitation(invitationsId, body);
  }

  @Delete(':id')
  @UseGuards(accessTokenAuthGuard)
  async removeInvitations(
    @Param('id') invitationsId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    const invitations =
      await this.invitationService.getInvitation(invitationsId);
    if (!invitations)
      throw new NotFoundException("Cette invitation n'existe pas !");
    if (
      !(await this.teamService.IsMemberOfTeam(userId, invitations.teamId)) &&
      !(await this.userService.isAdmin(userId))
    )
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.invitationService.DeleteInvitation(invitationsId);
  }
}
