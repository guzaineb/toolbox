import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JuriesService } from './juries.service';
import { CreateJurySessionDto } from './dto/create-jury-session.dto';
import { UpdateJurySessionDto } from './dto/update-jury-session.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class JuriesController {
  constructor(private readonly juriesService: JuriesService) {}

  @Post('projects/:projectId/jury-sessions')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateJurySessionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.juriesService.create(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/jury-sessions')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.juriesService.findByProject(projectId, req.user.id);
  }

  @Get('jury-sessions/:id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.juriesService.findOne(id, req.user.id);
  }

  @Patch('jury-sessions/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJurySessionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.juriesService.update(id, dto, req.user.id);
  }

  @Post('jury-sessions/:id/close')
  @HttpCode(HttpStatus.OK)
  close(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.juriesService.close(id, req.user.id);
  }
}
