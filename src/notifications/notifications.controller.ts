import { Controller, Delete, Param, Put } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  @Put(':id/read')
  markAdReadNotif(@Param('id') notifId: string) {}

  @Delete(':id')
  removeNotif(@Param('id') notifId: string) {}
}
