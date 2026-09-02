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
import { EvaluationTemplatesService } from './evaluation-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class EvaluationTemplatesController {
  constructor(private readonly templatesService: EvaluationTemplatesService) {}

  @Post('cohorts/:cohortId/evaluation-templates')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('cohortId') cohortId: string,
    @Body() dto: CreateTemplateDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.templatesService.create(cohortId, dto, req.user.id);
  }

  @Get('cohorts/:cohortId/evaluation-templates')
  findByCohort(
    @Param('cohortId') cohortId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.templatesService.findByCohort(cohortId, req.user.id);
  }

  @Get('evaluation-templates/:id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.templatesService.findOne(id, req.user.id);
  }

  @Patch('evaluation-templates/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.templatesService.update(id, dto, req.user.id);
  }

  @Post('evaluation-templates/:id/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.templatesService.publish(id, req.user.id);
  }
}
