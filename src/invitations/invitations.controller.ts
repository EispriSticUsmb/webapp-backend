import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

@Controller('invitations')
export class InvitationsController {
  @Get(':id')
  getInvitations(@Param('id') invitationsId: string) {}

  @Post(':id/respond')
  respondInvitation(@Param('id') invitationsId: string) {}

  @Delete(':id')
  removeInvitations(@Param('id') invitationsId: string) {}
}
