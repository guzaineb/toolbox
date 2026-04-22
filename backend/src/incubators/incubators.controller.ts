import {Controller, Post, Body, Get, Param, UseGuards, Req, Patch, Delete, HttpCode, HttpStatus,} from '@nestjs/common';
import { IncubatorsService } from './incubators.service';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateIncubatorDto } from './dto/update-incubator.dto';
import { UpdateStatusDto, UpdateVerificationDto } from './dto/update-status.dto';

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
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateIncubatorDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.incubatorsService.update(id, dto, req.user.id);
  }

    @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.incubatorsService.remove(id, req.user.id);
  }

 @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.incubatorsService.updateStatus(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/verification')
  updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.incubatorsService.updateVerification(id, dto, req.user.id);
  }


}