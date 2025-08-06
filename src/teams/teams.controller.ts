import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamService: TeamsService,
    private readonly userService: UserService,
  ) {}
  @Get(':id')
  async getTeam(@Param('id') teamId: string) {
    return await this.teamService.getTeam(teamId);
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
    return this.teamService.updateLeaderTeam(teamId, body.leaderId);
  }

  @Post(':id/members')
  addTeamMember(@Param('id') teamId: string) {}

  @Delete(':id/members/:userId')
  removeTeamMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
  ) {}

  @Get(':id/invitations')
  getTeamInvitations(@Param('id') teamId: string) {}

  @Post(':id/invitations')
  createTeamInvitations(@Param('id') teamId: string) {}
}
