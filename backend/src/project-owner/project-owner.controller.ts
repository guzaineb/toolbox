import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ProjectOwnerService } from './project-owner.service';
import { CreateProjectOwnerDto } from './dto/create-project-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Controller('project-owner')
@UseGuards(JwtAuthGuard)
export class ProjectOwnerController {
  constructor(private service: ProjectOwnerService) {}

  @Post()
  create(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateProjectOwnerDto,
  ) {
    return this.service.create(req.user.id, dto);
  }

  @Get('me')
  findMine(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  // ✅ Upsert : crée si inexistant, met à jour sinon
  @Patch('me')
  update(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateProjectOwnerDto,
  ) {
    return this.service.upsert(req.user.id, dto);
  }
  @Post('skills')
  addSkill(@Req() req: { user: { id: string } }, @Body() dto: CreateSkillDto) {
    return this.service.addSkill(req.user.id, dto);
  }
  @Get('skills')
  getSkills(@Req() req: { user: { id: string } }) {
    return this.service.getSkills(req.user.id);
  }

  @Delete('skills/:id')
  deleteSkill(
    @Req() req: { user: { id: string } },
    @Param('id') skillId: string,
  ) {
    return this.service.deleteSkill(req.user.id, skillId);
  }
  @Post('experiences')
  addExperience(
    @Req() req: { user: { id: string } },
    @Body() dto: CreateExperienceDto,
  ) {
    return this.service.addExperience(req.user.id, dto);
  }

  @Get('experiences')
  getExperiences(@Req() req: { user: { id: string } }) {
    return this.service.getExperiences(req.user.id);
  }

  @Delete('experiences/:id')
  deleteExperience(
    @Req() req: { user: { id: string } },
    @Param('id') expId: string,
  ) {
    return this.service.deleteExperience(req.user.id, expId);
  }
  @Get('admin/all')
  async adminFindAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.service.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') profileId: string) {
    return this.service.findById(profileId);
  }
}
