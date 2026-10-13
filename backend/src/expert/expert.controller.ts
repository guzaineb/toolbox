import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';
import { UpdateExpertiseLevelDto } from './dto/update-expertise-level.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AvailabilityStatus, UserRole } from '@prisma/client';
import { ExpertService } from './expert.service';

@Controller('experts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpertController {
  constructor(private readonly service: ExpertService) {}

  @Post()
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateExpertDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.EXPERT)
  findMyProfile(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  @Patch('me')
  @Roles(UserRole.EXPERT)
  updateProfile(
    @Req() req: { user: { id: string } },
    @Body() dto: UpdateExpertDto,
  ) {
    return this.service.upsert(req.user.id, dto);
  }

  @Delete('me')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfile(@Req() req: { user: { id: string } }) {
    return this.service.deleteProfile(req.user.id);
  }

  /**
   * Annuaire des experts de la plateforme (consultation par les incubateurs).
   */
  @Get()
  @Roles(UserRole.INCUBATOR_MEMBER)
  findAll(
    @Query('q') q?: string,
    @Query('expertiseAreaId') expertiseAreaId?: string,
    @Query('availability') availability?: AvailabilityStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      q,
      expertiseAreaId,
      availability,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * Recherche d'experts (autocomplétion pour inviter un expert dans une cohorte).
   */
  @Get('search')
  @Roles(UserRole.INCUBATOR_MEMBER, UserRole.EXPERT)
  search(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.service.searchUsers(
      q ?? '',
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get('expertise-areas')
  getAllExpertiseAreas() {
    return this.service.getAllAreas();
  }

  @Get('expertise-areas/categories')
  getExpertiseAreasByCategory() {
    return this.service.getAreasGroupedByCategory();
  }

  @Get('me/expertises')
  @Roles(UserRole.EXPERT)
  getMyExpertises(@Req() req: { user: { id: string } }) {
    return this.service.getExpertiseWithDetails(req.user.id);
  }

  @Post('me/expertises')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.CREATED)
  addExpertise(
    @Req() req: { user: { id: string } },
    @Body() dto: AddExpertiseDto,
  ) {
    return this.service.addExpertise(req.user.id, dto);
  }

  @Post('me/expertises/batch')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.CREATED)
  addMultipleExpertises(
    @Req() req: { user: { id: string } },
    @Body() body: { expertises: AddExpertiseDto[] },
  ) {
    return this.service.addMultipleExpertise(req.user.id, body.expertises);
  }

  @Patch('me/expertises/:expertiseAreaId')
  @Roles(UserRole.EXPERT)
  updateExpertiseLevel(
    @Req() req: { user: { id: string } },
    @Param('expertiseAreaId', ParseUUIDPipe) expertiseAreaId: string,
    @Body() dto: UpdateExpertiseLevelDto,
  ) {
    return this.service.updateExpertiseLevel(
      req.user.id,
      expertiseAreaId,
      dto.level,
      dto.years_of_experience,
    );
  }

  @Delete('me/expertises/:expertiseAreaId')
  @Roles(UserRole.EXPERT)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExpertise(
    @Req() req: { user: { id: string } },
    @Param('expertiseAreaId', ParseUUIDPipe) expertiseAreaId: string,
  ) {
    return this.service.removeExpertise(req.user.id, expertiseAreaId);
  }

  @Get('me/score')
  @Roles(UserRole.EXPERT)
  getMyExpertScore(@Req() req: { user: { id: string } }) {
    return this.service.computeExpertScore(req.user.id);
  }

  @Get('me/assignable-projects')
  @Roles(UserRole.EXPERT)
  getAssignableProjects(@Query('limit') limit?: string) {
    return this.service.findAssignableProjects(limit ? parseInt(limit) : 50);
  }

  @Get(':id')
  @Roles(UserRole.EXPERT, UserRole.INCUBATOR_MEMBER)
  findOneExpert(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getPublicProfile(id);
  }

  @Post('recommendations/jury')
  @Roles(UserRole.EXPERT, UserRole.INCUBATOR_MEMBER)
  recommendJury(@Body() body: { projectId: string; limit?: number }) {
    return this.service.recommendJuryForProject(
      body.projectId,
      body.limit || 3,
    );
  }

  @Post('recommendations/coachs')
  @Roles(UserRole.EXPERT, UserRole.INCUBATOR_MEMBER)
  recommendCoachs(
    @Body() body: { cohortId: string; limit?: number; excludeIds?: string[] },
  ) {
    return this.service.recommendCoachsForCohort(
      body.cohortId,
      body.limit || 3,
      body.excludeIds || [],
    );
  }
}
