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
import { CoachingAiService } from '../ai/analysis/coaching-ai.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateEvidenceDto, ReviewEvidenceDto } from './dto/evidence.dto';
import { CreateAiRecommendationDto } from './dto/create-ai-recommendation.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CoachingController {
  constructor(
    private readonly coachingService: CoachingService,
    private readonly coachingAi: CoachingAiService,
  ) {}

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

  @Post('coaching/sessions/:id/start')
  @HttpCode(HttpStatus.OK)
  startSession(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.coachingService.startSession(id, req.user.id);
  }

  // ==================== IA DE SESSION (proposition → validation coach) ====================

  /** Brief préparé par l'IA avant la session (le coach garde la main sur le contenu). */
  @Post('coaching/sessions/:id/ai-brief')
  @HttpCode(HttpStatus.OK)
  async aiSessionBrief(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    const payload = await this.coachingAi.generateBrief(id, req.user.id);
    return { success: !!payload, data: payload };
  }

  /** Résumé proposé par l'IA en fin de session ; le coach l'applique ensuite via PATCH s'il le valide. */
  @Post('coaching/sessions/:id/ai-summary')
  @HttpCode(HttpStatus.OK)
  async aiSessionSummary(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    const payload = await this.coachingAi.summarizeSession(id, req.user.id);
    return { success: !!payload, data: payload };
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

  /** Valide une suggestion IA en recommandation officielle (source = AI). */
  @Post('projects/:projectId/coaching/recommendations/from-ai')
  @HttpCode(HttpStatus.CREATED)
  createAiRecommendation(
    @Param('projectId') projectId: string,
    @Body() dto: CreateAiRecommendationDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.createAiRecommendation(projectId, dto, req.user.id);
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

  // ==================== PREUVES D'ACTION ====================

  /** Le porteur soumet une preuve de réalisation. */
  @Post('coaching/actions/:id/evidences')
  @HttpCode(HttpStatus.CREATED)
  addEvidence(
    @Param('id') id: string,
    @Body() dto: CreateEvidenceDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.addEvidence(id, dto, req.user.id);
  }

  @Get('coaching/actions/:id/evidences')
  findEvidences(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.coachingService.findEvidences(id, req.user.id);
  }

  /** Le coach valide ou rejette une preuve. */
  @Patch('coaching/evidences/:id/review')
  reviewEvidence(
    @Param('id') id: string,
    @Body() dto: ReviewEvidenceDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.coachingService.reviewEvidence(id, dto, req.user.id);
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
