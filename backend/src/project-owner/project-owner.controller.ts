import {
  Controller, Post, Body, Get, UseGuards, Req, Patch,
} from '@nestjs/common';
import { ProjectOwnerService } from './project-owner.service';
import { CreateProjectOwnerDto } from './dto/create-project-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('project-owner')
@UseGuards(JwtAuthGuard)
export class ProjectOwnerController {
  constructor(private service: ProjectOwnerService) {}

  // ✅ Crée ou met à jour le profil porteur de projet du user connecté
  @Post()
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateProjectOwnerDto) {
    return this.service.create(req.user.id, dto);
  }

  // ✅ Récupère le profil porteur du user connecté
  @Get('me')
  findMine(@Req() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }

  // ✅ Upsert : crée si inexistant, met à jour sinon
  @Patch('me')
  update(@Req() req: { user: { id: string } }, @Body() dto: CreateProjectOwnerDto) {
    return this.service.upsert(req.user.id, dto);
  }
}