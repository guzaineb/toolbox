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

  @Get(':projectId')
  async findOne(
    @Req() req: { user: { id: string } },
    @Param('projectId') projectId: string,
  ) {
    return this.projectsService.findOwnedOrThrow(projectId, req.user.id);
  }
}
