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
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post('incubators/:incubatorId/cohorts')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('incubatorId') incubatorId: string,
    @Body() dto: CreateCohortDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortsService.create(incubatorId, dto, req.user.id);
  }

  @Get('incubators/:incubatorId/cohorts')
  findAllByIncubator(@Param('incubatorId') incubatorId: string) {
    return this.cohortsService.findAllByIncubator(incubatorId);
  }

  @Get('cohorts/open')
  findOpenCohorts() {
    return this.cohortsService.findOpenCohorts();
  }

  @Get('cohorts/available')
  findAvailableCohorts(@Req() req: { user: { id: string } }) {
    return this.cohortsService.findAvailableCohorts(req.user.id);
  }

  @Get('cohorts/my')
  findMyCohorts(@Req() req: { user: { id: string } }) {
    return this.cohortsService.findMyCohorts(req.user.id);
  }

  @Get('cohorts/:id')
  findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(id);
  }

  @Patch('cohorts/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCohortDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortsService.update(id, dto, req.user.id);
  }

  @Post('cohorts/:id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.cohortsService.publish(id, req.user.id);
  }

  @Post('cohorts/:id/start')
  @HttpCode(HttpStatus.OK)
  start(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.cohortsService.start(id, req.user.id);
  }

  @Post('cohorts/:id/close')
  @HttpCode(HttpStatus.OK)
  close(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.cohortsService.close(id, req.user.id);
  }

  @Post('cohorts/:id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.cohortsService.archive(id, req.user.id);
  }

  @Get('cohorts/:id/progress')
  getProgress(@Param('id') id: string) {
    return this.cohortsService.getProgress(id);
  }

  @Get('cohorts/:id/coaching-projects')
  findCoachingProjects(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.cohortsService.findCoachingProjects(id, req.user.id);
  }
}
