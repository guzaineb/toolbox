import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { IncubatorsService } from './incubators.service';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incubators')
export class IncubatorsController {
  constructor(private incubatorsService: IncubatorsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateIncubatorDto) {
    return this.incubatorsService.create(req.user.id, dto);
  }

  @Get()
  findAll() {
    return this.incubatorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incubatorsService.findOne(id);
  }
}