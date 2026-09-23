import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: { user: { id: string } }) {
    return this.notificationsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  countUnread(@Req() req: { user: { id: string } }) {
    return this.notificationsService.countUnread(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllAsRead(@Req() req: { user: { id: string } }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
