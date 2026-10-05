import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('owner')
  @Roles(UserRole.PROJECT_OWNER)
  getOwnerDashboard(@Req() req: { user: { id: string } }) {
    return this.dashboard.getOwnerDashboard(req.user.id);
  }

  @Get('expert')
  @Roles(UserRole.EXPERT)
  getExpertDashboard(@Req() req: { user: { id: string } }) {
    return this.dashboard.getExpertDashboard(req.user.id);
  }

  @Get('incubator')
  @Roles(UserRole.INCUBATOR_MEMBER)
  getIncubatorDashboard(@Req() req: { user: { id: string } }) {
    return this.dashboard.getIncubatorDashboard(req.user.id);
  }
}
