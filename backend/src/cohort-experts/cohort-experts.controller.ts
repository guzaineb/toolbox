import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CohortExpertsService } from './cohort-experts.service';
import { CreateCohortExpertDto } from './dto/create-cohort-expert.dto';
import { UpdateCohortExpertDto } from './dto/update-cohort-expert.dto';
import { CohortExpertRole, CohortExpertStatus } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class CohortExpertsController {
  constructor(private readonly cohortExpertsService: CohortExpertsService) {}

  @Post('cohorts/:cohortId/experts')
  @HttpCode(HttpStatus.CREATED)
  assign(
    @Param('cohortId') cohortId: string,
    @Body() dto: CreateCohortExpertDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.assign(cohortId, dto, req.user.id);
  }

  @Get('cohorts/:cohortId/experts')
  findByCohort(
    @Param('cohortId') cohortId: string,
    @Query('role') role?: CohortExpertRole,
    @Query('status') status?: CohortExpertStatus,
  ) {
    return this.cohortExpertsService.findByCohort(cohortId, { role, status });
  }

  @Get('cohorts/:cohortId/experts/available')
  findAvailable(
    @Param('cohortId') cohortId: string,
    @Query('expertiseAreaId') expertiseAreaId?: string,
    @Query('availability') availability?: string,
  ) {
    return this.cohortExpertsService.findAvailable(cohortId, {
      expertiseAreaId,
      availability,
    });
  }

  @Get('cohort-experts/:id')
  findOne(@Param('id') id: string) {
    return this.cohortExpertsService.findOne(id);
  }

  @Patch('cohort-experts/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCohortExpertDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.update(id, dto, req.user.id);
  }

  @Delete('cohort-experts/:id')
  @HttpCode(HttpStatus.OK)
  deactivate(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.deactivate(id, req.user.id);
  }
}
