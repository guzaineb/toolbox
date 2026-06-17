import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/versions')
export class VersionsController {
  constructor(private versionsService: VersionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getVersions(@Param('projectId') projectId: string) {
    return this.versionsService.getVersions(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrentVersion(@Param('projectId') projectId: string) {
    return this.versionsService.getCurrentVersion(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':versionId')
  getVersion(@Param('versionId') versionId: string) {
    return this.versionsService.getVersion(versionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createVersion(
    @Param('projectId') projectId: string,
    @Body() dto: CreateVersionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.versionsService.createVersion(projectId, req.user.id, dto.label);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':versionId/restore')
  restoreVersion(
    @Param('versionId') versionId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.versionsService.restoreVersion(versionId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('compare/:v1/:v2')
  compareVersions(@Param('v1') v1: string, @Param('v2') v2: string) {
    return this.versionsService.compareVersions(v1, v2);
  }
}
