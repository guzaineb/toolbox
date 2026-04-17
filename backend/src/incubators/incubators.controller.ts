import {Controller, Post, Body, Get, Param, UseGuards, Req, Patch,} from '@nestjs/common';
import { IncubatorsService } from './incubators.service';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incubators')
export class IncubatorsController {
  constructor(private incubatorsService: IncubatorsService) {}

  // ✅ /incubators/my AVANT /:id pour éviter le conflit de routes
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMine(@Req() req: { user: { id: string } }) {
    return this.incubatorsService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateIncubatorDto) {
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