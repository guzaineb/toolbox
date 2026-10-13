import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Req() req: { user: { id: string } },
    @Body() data: { name: string; description?: string },
  ) {
    return this.projectsService.create(req.user.id, data);
  }

  @Get()
  async findAll(@Req() req: { user: { id: string } }) {
    return this.projectsService.findByOwner(req.user.id);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.projectsService.search(query);
  }

  /**
   * Annuaire des projets — réservé aux incubateurs (découverte + invitation
   * dans une cohorte).
   */
  @Get('directory')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INCUBATOR_MEMBER)
  async directory(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findDirectory({
      q,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':projectId')
  async findOne(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.findOwnedOrThrow(projectId, req.user.id);
  }
}
