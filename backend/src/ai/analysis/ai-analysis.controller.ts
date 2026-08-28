import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { EvaluationAiService } from './evaluation-ai.service';
import { ImprovementPlannerService } from './improvement-planner.service';
import { RiskAnalysisService } from './risk-analysis.service';
import { JuryAiService } from './jury-ai.service';
import { ProgressAnalysisService } from './progress-analysis.service';
import {
  AiAnalysisQueryDto,
  GenerateImprovementPlanDto,
  ProgressAnalysisDto,
} from './dto/ai-analysis.dto';

type RequestUser = { user: { id: string } };

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/ai')
export class AiAnalysisController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly evaluationAi: EvaluationAiService,
    private readonly planner: ImprovementPlannerService,
    private readonly riskAnalysis: RiskAnalysisService,
    private readonly juryAi: JuryAiService,
    private readonly progressAnalysis: ProgressAnalysisService,
  ) {}

  // ==================== ANALYSE D'ÉVALUATION ====================

  @Post('evaluations/:evaluationId/analyze')
  async analyzeEvaluation(
    @Param('projectId') projectId: string,
    @Param('evaluationId') evaluationId: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const payload = await this.evaluationAi.analyzeEvaluation(projectId, evaluationId, req.user.id);
    return { success: !!payload, data: payload };
  }

  // ==================== PLAN D'AMÉLIORATION (brouillon à valider par le coach) ====================

  @Post('improvement-plan/generate')
  async generatePlan(
    @Param('projectId') projectId: string,
    @Body() dto: GenerateImprovementPlanDto,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanManageProjectCoaching(projectId, req.user.id);
    return this.planner.generateFromEvaluation(projectId, dto.evaluationId, req.user.id);
  }

  // ==================== ANALYSE DE RISQUES ====================

  @Post('risks/analyze')
  async analyzeRisks(@Param('projectId') projectId: string, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const payload = await this.riskAnalysis.analyze(projectId, req.user.id);
    return { success: !!payload, data: payload };
  }

  // ==================== BRIEFING JURY (sans aucune note) ====================

  @Post('jury-briefing')
  async juryBriefing(@Param('projectId') projectId: string, @Req() req: RequestUser) {
    await this.access.assertCanEvaluateProject(projectId, req.user.id);
    const payload = await this.juryAi.buildBriefing(projectId);
    return { success: !!payload, data: payload };
  }

  // ==================== PROGRESSION ENTRE DEUX ÉVALUATIONS ====================

  @Post('progress/analyze')
  async analyzeProgress(
    @Param('projectId') projectId: string,
    @Body() dto: ProgressAnalysisDto,
    @Req() req: RequestUser,
  ): Promise<{ success: boolean; data: unknown | null }> {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const payload = await this.progressAnalysis.analyze(
      projectId,
      dto.fromEvaluationId,
      dto.toEvaluationId,
    );
    if (payload) {
      // Persistance pour historique ; les chiffres restent calculés côté backend
      await this.prisma.aiAnalysis
        .create({
          data: {
            project_id: projectId,
            type: 'PROGRESS_ANALYSIS',
            status: 'COMPLETED',
            payload: payload as unknown as Prisma.InputJsonValue,
            created_by: req.user.id,
          },
        })
        .catch(() => undefined);
    }
    return { success: !!payload, data: payload };
  }

  // ==================== HISTORIQUE DES ANALYSES ====================

  @Get('analyses')
  async listAnalyses(
    @Param('projectId') projectId: string,
    @Query() query: AiAnalysisQueryDto,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const analyses = await this.prisma.aiAnalysis.findMany({
      where: {
        project_id: projectId,
        ...(query.type ? { type: query.type as never } : {}),
      },
      orderBy: { created_at: 'desc' },
      take: 30,
    });
    // Tableau brut : convention de l'API (le service frontend attend un Array).
    return analyses;
  }

  @Get('analyses/:id')
  async getAnalysis(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);
    const analysis = await this.prisma.aiAnalysis.findUnique({ where: { id } });
    if (!analysis || analysis.project_id !== projectId) throw new NotFoundException();
    return analysis;
  }
}
