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
import { FinalDecisionsService } from './final-decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import { AddConditionsDto } from './dto/conditions.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class FinalDecisionsController {
  constructor(private readonly finalDecisionsService: FinalDecisionsService) {}

  @Post('projects/:projectId/final-decision')
  @HttpCode(HttpStatus.CREATED)
  makeDecision(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDecisionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.finalDecisionsService.makeDecision(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/final-decision')
  findByProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.finalDecisionsService.findByProject(projectId, req.user.id);
  }

  @Get('final-decisions/:id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.finalDecisionsService.findOne(id, req.user.id);
  }

  @Patch('final-decisions/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDecisionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.finalDecisionsService.update(id, dto, req.user.id);
  }

  @Post('final-decisions/:id/conditions')
  @HttpCode(HttpStatus.CREATED)
  addConditions(
    @Param('id') id: string,
    @Body() dto: AddConditionsDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.finalDecisionsService.addConditions(id, dto, req.user.id);
  }

  @Patch('final-decision-conditions/:id')
  updateCondition(
    @Param('id') id: string,
    @Body() dto: { description?: string; deadline?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.finalDecisionsService.updateCondition(id, dto, req.user.id);
  }

  @Post('final-decision-conditions/:id/validate')
  @HttpCode(HttpStatus.OK)
  validateCondition(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.finalDecisionsService.validateCondition(id, req.user.id);
  }
}
