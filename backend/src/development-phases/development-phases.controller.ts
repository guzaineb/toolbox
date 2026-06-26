import { Controller, Get, UseGuards } from '@nestjs/common';
import { DevelopmentPhasesService } from './development-phases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('development-phases')
export class DevelopmentPhasesController {
  constructor(private phasesService: DevelopmentPhasesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.phasesService.findAll();
  }
}
