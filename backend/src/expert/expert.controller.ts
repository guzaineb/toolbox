import {
  Controller, Post, Body, Get, Patch, UseGuards, Req,
} from '@nestjs/common';
import { ExpertService } from './expert.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expert')
@UseGuards(JwtAuthGuard)
export class ExpertController {
  constructor(private service: ExpertService) {}

  @Post()
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateExpertDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('me')
  findMine(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  @Patch('me')
  update(@Req() req: { user: { id: string } }, @Body() dto: CreateExpertDto) {
    return this.service.upsert(req.user.id, dto);
  }

  // ✅ Liste toutes les expertise areas disponibles (pour le select du formulaire)
  @Get('expertise-areas')
  getAllAreas() {
    return this.service.getAllAreas();
  }
}