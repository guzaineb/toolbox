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
import { CoachingService } from './coaching.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) {}

  // ==================== SESSIONS ====================

  @Post('projects/:projectId/coaching/sessions')
  @HttpCode(HttpStatus.CREATED)
  createSession(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSessionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.createSession(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/coaching/sessions')
  findSessionsByProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.findSessionsByProject(projectId, req.user.id);
  }

  @Get('coaching/sessions/:id')
  findSession(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.coachingService.findSessionById(id, req.user.id);
  }

  @Patch('coaching/sessions/:id')
  updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.updateSession(id, dto, req.user.id);
  }

  @Post('coaching/sessions/:id/complete')
  @HttpCode(HttpStatus.OK)
  completeSession(
    @Param('id') id: string,
    @Body() dto: { report?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.completeSession(id, dto, req.user.id);
  }

  // ==================== RECOMMANDATIONS ====================

  @Post('projects/:projectId/coaching/recommendations')
  @HttpCode(HttpStatus.CREATED)
  createRecommendation(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRecommendationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.createRecommendation(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/coaching/recommendations')
  findRecommendations(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.findRecommendationsByProject(projectId, req.user.id);
  }

  @Patch('coaching/recommendations/:id')
  updateRecommendation(
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.updateRecommendation(id, dto, req.user.id);
  }

  // ==================== ACTIONS ====================

  @Post('projects/:projectId/coaching/actions')
  @HttpCode(HttpStatus.CREATED)
  createAction(
    @Param('projectId') projectId: string,
    @Body() dto: CreateActionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.createAction(projectId, dto, req.user.id);
  }

  @Get('projects/:projectId/coaching/actions')
  findActions(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.findActionsByProject(projectId, req.user.id);
  }

  @Patch('coaching/actions/:id')
  updateAction(
    @Param('id') id: string,
    @Body() dto: UpdateActionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.updateAction(id, dto, req.user.id);
  }

  // ==================== COMMENTAIRES ====================

  @Post('coaching/actions/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  addActionComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.addComment({ actionId: id }, dto, req.user.id);
  }

  @Get('coaching/actions/:id/comments')
  findActionComments(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.findComments({ actionId: id }, req.user.id);
  }

  @Post('coaching/sessions/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  addSessionComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.addComment({ sessionId: id }, dto, req.user.id);
  }

  @Get('coaching/sessions/:id/comments')
  findSessionComments(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.findComments({ sessionId: id }, req.user.id);
  }

  // ==================== TABLEAU DE BORD ====================

  @Get('projects/:projectId/coaching/overview')
  getOverview(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.getOverview(projectId, req.user.id);
  }

  @Get('projects/:projectId/coaching')
  getCoachingDashboard(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.getOverview(projectId, req.user.id);
  }

  // ==================== VUE EXPERT ====================

  @Get('experts/me/coaching/sessions')
  findMySessions(@Req() req: { user: { id: string } }) {
    return this.coachingService.findMyCoachingSessions(req.user.id);
  }

  @Get('experts/me/coaching/actions')
  findMyActions(@Req() req: { user: { id: string } }) {
    return this.coachingService.findMyCoachingActions(req.user.id);
  }
}
