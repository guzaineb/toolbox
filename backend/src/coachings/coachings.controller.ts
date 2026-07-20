import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoachingsService } from './coachings.service';
import { CreateCoachingDto, UpdateCoachingDto } from './dto/coaching.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CoachingsController {
  constructor(private readonly coachingsService: CoachingsService) {}

  @Post('projects/:projectId/coachings')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCoachingDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingsService.create(projectId, dto, req.user.id);
  }

  @Patch('coachings/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCoachingDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingsService.update(id, dto, req.user.id);
  }

  @Get('coachings/:id')
  findOne(@Param('id') id: string) {
    return this.coachingsService.findOne(id);
  }

  @Get('projects/:projectId/coachings')
  findByProject(@Param('projectId') projectId: string) {
    return this.coachingsService.findByProject(projectId);
  }

  @Get('cohorts/:cohortId/coachings')
  findByCohort(@Param('cohortId') cohortId: string) {
    return this.coachingsService.findByCohort(cohortId);
  }

  @Get('experts/me/coachings')
  findMyCoachings(@Req() req: { user: { id: string } }) {
    return this.coachingsService.findMyCoachings(req.user.id);
  }
}
