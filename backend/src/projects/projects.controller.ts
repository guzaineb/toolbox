import { Controller, Post, Body, Get, Param, UseGuards, Req, Patch, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto, UpdateProjectStatusDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: { user: { id: string; role?: string } }) {
    return this.projectsService.findAll(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Req() req: { user: { id: string } }, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Req() req: { user: { id: string } }, @Body() dto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.projectsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/progress')
  getProgress(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.projectsService.getProgress(id, req.user.id);
  }
}
