import { Controller, Get, Param, Patch, Body, UseGuards, Req, Post } from '@nestjs/common';
import { JourneyService } from './journey.service';
import { UpdateStepDto } from './dto/update-step.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/steps')
export class JourneyController {
  constructor(private journeyService: JourneyService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getSteps(@Param('projectId') projectId: string) {
    return this.journeyService.getSteps(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':stepNumber')
  getStep(@Param('projectId') projectId: string, @Param('stepNumber') stepNumber: string) {
    return this.journeyService.getStep(projectId, +stepNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':stepNumber')
  updateStep(
    @Param('projectId') projectId: string,
    @Param('stepNumber') stepNumber: string,
    @Body() dto: UpdateStepDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.journeyService.updateStep(projectId, +stepNumber, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':stepNumber/submit')
  submitStep(
    @Param('projectId') projectId: string,
    @Param('stepNumber') stepNumber: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.journeyService.submitStep(projectId, +stepNumber, req.user.id);
  }
}
