import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { accessTokenAuthGuard } from 'src/auth/accessToken.auth.gard';
import { UserService } from 'src/user/user.service';
import { RequestWithUser } from 'src/types/user-payload.type';
import { leaderIdDto, NameTeamDto } from './dto/team.dto';
import { identifierDto, userIdDto } from 'src/user/dto/user.dto';
import { answerDto } from 'src/invitations/dto/answer.dto';
import { InvitationsService } from 'src/invitations/invitations.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamService: TeamsService,
    private readonly userService: UserService,
    private readonly invitationService: InvitationsService,
  ) {}
  @Get(':id')
  async getTeam(@Param('id') teamId: string) {
    const team = await this.teamService.getTeam(teamId);
    if (!team) throw new NotFoundException('Équipe introuvable !');
    return team;
  }

  @Delete(':id')
  @UseGuards(accessTokenAuthGuard)
  async deleteTeam(
    @Param('id') teamId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId: string = request.user.userId;
    if (
      !(
        (await this.userService.isAdmin(userId)) ||
        (await this.teamService.isLeaderTeam(teamId, userId))
      )
    )
      throw new ForbiddenException(
        "Tu dois être chef de l'équipe pour la supprimer !",
      );
    await this.teamService.deleteTeam(teamId);
  }

  @Put(':id/name')
  @UseGuards(accessTokenAuthGuard)
  async upTeamName(
    @Param('id') teamId: string,
    @Request() request: RequestWithUser,
    @Body() body: NameTeamDto,
  ) {
    const userId: string = request.user.userId;
    if (
      !(
        (await this.userService.isAdmin(userId)) ||
        (await this.teamService.isLeaderTeam(teamId, userId))
      )
    )
      throw new ForbiddenException(
        "Tu dois être chef de l'équipe pour changer son nom !",
      );
    return await this.teamService.ChangeTeamName(teamId, body.name);
  }

  @Put(':id/leaderId')
  @UseGuards(accessTokenAuthGuard)
  async leaderIdTeamName(
    @Param('id') teamId: string,
    @Request() request: RequestWithUser,
    @Body() body: leaderIdDto,
  ) {
    const userId: string = request.user.userId;
    if (
      !(
        (await this.userService.isAdmin(userId)) ||
        (await this.teamService.isLeaderTeam(teamId, userId))
      )
    )
      throw new ForbiddenException(
        "Tu dois être chef de l'équipe pour changer son dirigeant !",
      );
    if (!(await this.teamService.IsMemberOfTeam(body.leaderId, teamId)))
      throw new ForbiddenException(
        "Le nouveau chef d'équipe doit en faire partie !",
      );
    return this.teamService.updateLeaderTeam(teamId, body.leaderId);
  }

  @Post(':id/members')
  @UseGuards(accessTokenAuthGuard)
  async addTeamMember(
    @Param('id') teamId: string,
    @Body() body: userIdDto,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    if (!(await this.userService.isAdmin(userId)))
      throw new ForbiddenException("Privilège d'administrateur requis");

    return this.teamService.addUserInTeam(body.userId, teamId);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(accessTokenAuthGuard)
  async removeTeamMember(
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    if (
      !(
        (await this.userService.isAdmin(userId)) ||
        (await this.teamService.isLeaderTeam(teamId, userId))
      )
    )
      throw new ForbiddenException(
        "Tu dois être chef de l'équipe pour exclure un membre !",
      );
    let removerId: undefined | string = undefined;
    if (await this.teamService.isLeaderTeam(teamId, userId)) removerId = userId;
    return await this.teamService.removeTeamMember(teamId, memberId, removerId);
  }

  @Get(':id/invitations')
  @UseGuards(accessTokenAuthGuard)
  async getTeamInvitations(
    @Param('id') teamId: string,
    @Request() request: RequestWithUser,
  ) {
    const userId = request.user.userId;
    if (
      !(
        (await this.userService.isAdmin(userId)) ||
        (await this.teamService.isLeaderTeam(teamId, userId))
      )
    )
      throw new ForbiddenException(
        "Tu dois être membre de l'équipe pour voir ses invitations !",
      );
    return await this.teamService.getTeamsInvitaion(teamId);
  }

  @Post(':id/invitations')
  @UseGuards(accessTokenAuthGuard)
  async createTeamInvitations(
    @Param('id') teamId: string,
    @Request() request: RequestWithUser,
    @Body() body: identifierDto,
  ) {
    const userId: string = request.user.userId;
    const invited = await this.userService.getUserByIdentifier(body.identifier);
    if (!invited) throw new NotFoundException('Utilisateur introuvable !');
    if (
      !(await this.userService.isAdmin(userId)) &&
      !(await this.teamService.IsMemberOfTeam(userId, teamId))
    )
      throw new ForbiddenException(
        "Vous devez être dans l'équipe pour inviter un utilisateur !",
      );
    if (await this.teamService.IsMemberOfTeam(invited.id, teamId))
      throw new BadRequestException("Cet utilisateur est déjà dans l'équipe !");
    if (await this.teamService.IsInvitedOfTeam(invited.id, teamId))
      throw new BadRequestException('Cet utiliateur a déjà été invité !');
    return await this.teamService.createTeamInvitationhandler(
      teamId,
      invited.id,
      userId,
    );
  }

  @Post(':id/invitations/:invitedId/respond')
  @UseGuards(accessTokenAuthGuard)
  async respondInvitation(
    @Param('id') teamId: string,
    @Param('invitedId') invitedId: string,
    @Request() request: RequestWithUser,
    @Body() body: answerDto,
  ) {
    const userId = request.user.userId;
    const invitations = await this.teamService.getInvByInvitedIdAndTeamId(
      teamId,
      invitedId,
    );
    if (!invitations)
      throw new NotFoundException('Cette invitation est introuvable !');
    if (
      userId !== invitations.invitedId &&
      !(await this.userService.isAdmin(userId))
    )
      throw new ForbiddenException("Privilège d'administrateur requis");
    return await this.invitationService.respondInvitation(invitations.id, body);
  }
}
