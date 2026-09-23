import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== LISTE (compatible existant + pagination/filtres) ====================

  @Get()
  findAll(
    @Req() req: { user: { id: string } },
    @Query() query?: QueryNotificationsDto,
  ) {
    return this.notificationsService.findAllByUser(req.user.id, {
      unreadOnly: query?.unreadOnly,
      page: query?.page,
      limit: query?.limit,
      type: query?.type,
      search: query?.search,
      sort: query?.sort,
      startDate: query?.startDate,
      endDate: query?.endDate,
      archived: query?.archived,
    });
  }

  // ==================== COMPTEUR NON LUES ====================

  @Get('unread-count')
  getUnreadCount(@Req() req: { user: { id: string } }) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  // ==================== DÉTAIL ====================

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.findById(id, req.user.id);
  }

  // ==================== MARQUER COMME LU ====================

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  // ==================== MARQUER TOUT LU ====================

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Req() req: { user: { id: string } }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // ==================== ARCHIVER ====================

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.archive(id, req.user.id);
  }

  // ==================== RESTAURER ====================

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.restore(id, req.user.id);
  }

  // ==================== SUPPRIMER ====================

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationsService.delete(id, req.user.id);
  }

  // ==================== PRÉFÉRENCES ====================

  @Get('preferences')
  getPreferences(@Req() req: { user: { id: string } }) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  updatePreferences(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }
}
