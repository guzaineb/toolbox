import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CohortParticipationsService } from './cohort-participations.service';
import { ApplyDto } from './dto/apply.dto';
import { InviteDto } from './dto/invite.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CohortParticipationsController {
  constructor(
    private readonly participationsService: CohortParticipationsService,
  ) {}

  @Post('cohorts/:cohortId/apply')
  @HttpCode(HttpStatus.CREATED)
  apply(
    @Param('cohortId') cohortId: string,
    @Body() dto: ApplyDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.participationsService.apply(cohortId, dto.projectId, req.user.id);
  }

  @Post('cohorts/:cohortId/invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @Param('cohortId') cohortId: string,
    @Body() dto: InviteDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.participationsService.invite(cohortId, dto.projectId, req.user.id);
  }

  @Post('participations/:id/accept')
  @HttpCode(HttpStatus.OK)
  accept(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.participationsService.accept(id, req.user.id);
  }

  @Post('participations/:id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.participationsService.reject(id, req.user.id);
  }

  @Post('participations/:id/withdraw')
  @HttpCode(HttpStatus.OK)
  withdraw(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.participationsService.withdraw(id, req.user.id);
  }

  @Get('cohorts/:cohortId/participations')
  findByCohort(@Param('cohortId') cohortId: string) {
    return this.participationsService.findByCohort(cohortId);
  }

  @Get('projects/:projectId/participations')
  findByProject(@Param('projectId') projectId: string) {
    return this.participationsService.findByProject(projectId);
  }

  @Get('participations/:id')
  findOne(@Param('id') id: string) {
    return this.participationsService.findOne(id);
  }
}
