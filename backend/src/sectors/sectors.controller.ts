import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SectorsService } from './sectors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sectors')
export class SectorsController {
  constructor(private sectorsService: SectorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.sectorsService.findAll();
  }
}
