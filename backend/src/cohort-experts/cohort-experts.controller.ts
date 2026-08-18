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
import { InviteExpertDto } from './dto/invite-expert.dto';
import { ApplyExpertDto } from './dto/apply-expert.dto';
import { UpdateCohortExpertDto } from './dto/update-cohort-expert.dto';
import { CohortExpertRole, CohortExpertStatus } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class CohortExpertsController {
  constructor(private readonly cohortExpertsService: CohortExpertsService) {}

  // === ASSIGNEMENT DIRECT ===
  @Post('cohorts/:cohortId/experts')
  @HttpCode(HttpStatus.CREATED)
  assign(
    @Param('cohortId') cohortId: string,
    @Body() dto: CreateCohortExpertDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.assign(cohortId, dto, req.user.id);
  }

  // === INVITATION D'UN EXPERT PAR L'INCUBATEUR ===
  @Post('cohorts/:cohortId/experts/invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @Param('cohortId') cohortId: string,
    @Body() dto: InviteExpertDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.invite(cohortId, dto, req.user.id);
  }

  // === CANDIDATURE D'UN EXPERT ===
  @Post('cohorts/:cohortId/experts/apply')
  @HttpCode(HttpStatus.CREATED)
  apply(
    @Param('cohortId') cohortId: string,
    @Body() dto: ApplyExpertDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.apply(cohortId, dto, req.user.id);
  }

  // === EXPERT — ACCEPTER UNE INVITATION ===
  @Post('cohort-experts/:id/accept-invitation')
  @HttpCode(HttpStatus.OK)
  acceptInvitation(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.acceptInvitation(id, req.user.id);
  }

  // === EXPERT — REFUSER UNE INVITATION ===
  @Post('cohort-experts/:id/reject-invitation')
  @HttpCode(HttpStatus.OK)
  rejectInvitation(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.rejectInvitation(id, req.user.id);
  }

  // === INCUBATEUR — ACCEPTER UNE CANDIDATURE EXPERT ===
  @Post('cohort-experts/:id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.approveApplication(id, req.user.id);
  }

  // === INCUBATEUR — REFUSER UNE CANDIDATURE EXPERT ===
  @Post('cohort-experts/:id/decline')
  @HttpCode(HttpStatus.OK)
  decline(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.declineApplication(id, req.user.id);
  }

  // === LECTURE ===
  @Get('cohorts/:cohortId/experts')
  findByCohort(
    @Param('cohortId') cohortId: string,
    @Req() req: { user: { id: string } },
    @Query('role') role?: CohortExpertRole,
    @Query('status') status?: CohortExpertStatus,
  ) {
    return this.cohortExpertsService.findByCohort(cohortId, { role, status }, req.user.id);
  }

  @Get('cohorts/:cohortId/experts/available')
  findAvailable(
    @Param('cohortId') cohortId: string,
    @Req() req: { user: { id: string } },
    @Query('expertiseAreaId') expertiseAreaId?: string,
    @Query('availability') availability?: string,
  ) {
    return this.cohortExpertsService.findAvailable(cohortId, {
      expertiseAreaId,
      availability,
    }, req.user.id);
  }

  @Get('cohort-experts/:id')
  findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortExpertsService.findOne(id, req.user.id);
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
