import {  Controller,Post,Body,Get,Patch,Delete,Param,UseGuards,Req,HttpCode,HttpStatus,ParseUUIDPipe,Query,ValidationPipe,} from '@nestjs/common';

import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { AddExpertiseDto } from './dto/add-expertise.dto';
import { UpdateExpertiseLevelDto } from './dto/update-expertise-level.dto';
import { MatchProjectDto } from './dto/match-project.dto';
import { ExpertFiltersDto } from './dto/expert-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpertService } from './expert.service';

@Controller('experts')
@UseGuards(JwtAuthGuard)
export class ExpertController {
  constructor(private readonly service: ExpertService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateExpertDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('me')
  findMyProfile(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  @Patch('me')
  updateProfile(@Req() req: { user: { id: string } }, @Body() dto: UpdateExpertDto) {
    return this.service.upsert(req.user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfile(@Req() req: { user: { id: string } }) {
    return this.service.deleteProfile(req.user.id);
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
  getMyExpertises(@Req() req: { user: { id: string } }) {
    return this.service.getExpertiseWithDetails(req.user.id);
  }

  @Post('me/expertises')
  @HttpCode(HttpStatus.CREATED)
  addExpertise(@Req() req: { user: { id: string } }, @Body() dto: AddExpertiseDto) {
    return this.service.addExpertise(req.user.id, dto);
  }

  @Post('me/expertises/batch')
  @HttpCode(HttpStatus.CREATED)
  addMultipleExpertises(@Req() req: { user: { id: string } }, @Body() body: { expertises: AddExpertiseDto[] }) {
    return this.service.addMultipleExpertise(req.user.id, body.expertises);
  }

  @Patch('me/expertises/:expertiseAreaId')
  updateExpertiseLevel(
    @Req() req: { user: { id: string } },
    @Param('expertiseAreaId', ParseUUIDPipe) expertiseAreaId: string,
    @Body() dto: UpdateExpertiseLevelDto,
  ) {
    return this.service.updateExpertiseLevel(req.user.id, expertiseAreaId, dto.level, dto.years_of_experience);
  }

  @Delete('me/expertises/:expertiseAreaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExpertise(@Req() req: { user: { id: string } }, @Param('expertiseAreaId', ParseUUIDPipe) expertiseAreaId: string) {
    return this.service.removeExpertise(req.user.id, expertiseAreaId);
  }

  @Get('me/score')
  getMyExpertScore(@Req() req: { user: { id: string } }) {
    return this.service.computeExpertScore(req.user.id);
  }

  @Post('me/match-project')
  matchWithProject(@Req() req: { user: { id: string } }, @Body() dto: MatchProjectDto) {
    return this.service.matchWithProject(req.user.id, dto);
  }

  @Get()
  findAllExperts(@Query(ValidationPipe) filters: ExpertFiltersDto) {
    return this.service.findAll(filters);
  }

  @Get('search')
  searchByEmail(@Query('q') query: string) {
    return this.service.searchByEmail(query);
  }

  // Routes analytics déclarées avant @Get(':id') : sinon « analytics » est
  // interprété comme un identifiant et ces endpoints sont inatteignables.
  @Get('analytics/top-experts')
  getTopExperts(@Query('limit') limit?: string, @Query('sortBy') sortBy?: 'score' | 'experience' | 'availability') {
    return this.service.getTopExperts({
      limit: limit ? parseInt(limit) : 10,
      sortBy: sortBy || 'score',
    });
  }

  @Get('analytics/expertise-stats')
  getExpertiseStatistics() {
    return this.service.getExpertiseStatistics();
  }

  @Get(':id')
  findOneExpert(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getPublicProfile(id);
  }

  @Post('recommendations/jury')
  recommendJury(@Body() body: { projectId: string; limit?: number }) {
    return this.service.recommendJuryForProject(body.projectId, body.limit || 3);
  }

  @Post('recommendations/coachs')
  recommendCoachs(@Body() body: { cohortId: string; limit?: number; excludeIds?: string[] }) {
    return this.service.recommendCoachsForCohort(body.cohortId, body.limit || 3, body.excludeIds || []);
  }
}