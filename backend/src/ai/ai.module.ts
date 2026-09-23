import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { LlmService } from './llm.service';
import { EmbeddingsService } from './embeddings.service';
import { ChromaService } from './chroma.service';
import { SummaryService } from './summary.service';
import { ReformulationService } from './reformulation.service';
import { ChatbotService } from './chatbot.service';
import { LlmController } from './controllers/deepseek.controller';
import { SummaryController } from './controllers/summary.controller';
import { ReformulationController } from './controllers/reformulation.controller';
import { ChatbotController } from './controllers/chatbot.controller';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { EvaluationAiService } from './analysis/evaluation-ai.service';
import { CoachingAiService } from './analysis/coaching-ai.service';
import { ImprovementPlannerService } from './analysis/improvement-planner.service';
import { RiskAnalysisService } from './analysis/risk-analysis.service';
import { JuryAiService } from './analysis/jury-ai.service';
import { ProgressAnalysisService } from './analysis/progress-analysis.service';
import { AiAnalysisController } from './analysis/ai-analysis.controller';
import { ImprovementPlanController } from './analysis/improvement-plan.controller';

@Module({
  providers: [
    AiService,
    LlmService,
    EmbeddingsService,
    ChromaService,
    SummaryService,
    ReformulationService,
    ChatbotService,
    ProjectContextBuilderService,
    EvaluationAiService,
    CoachingAiService,
    ImprovementPlannerService,
    RiskAnalysisService,
    JuryAiService,
    ProgressAnalysisService,
  ],
  controllers: [
    LlmController,
    SummaryController,
    ReformulationController,
    ChatbotController,
    AiAnalysisController,
    ImprovementPlanController,
  ],
  exports: [
    AiService,
    LlmService,
    EmbeddingsService,
    ChromaService,
    SummaryService,
    ReformulationService,
    ChatbotService,
    ProjectContextBuilderService,
    EvaluationAiService,
    CoachingAiService,
    ImprovementPlannerService,
    RiskAnalysisService,
    JuryAiService,
    ProgressAnalysisService,
  ],
})
export class AiModule {}
