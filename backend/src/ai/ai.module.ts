import { Module } from '@nestjs/common';
import { MaturityModule } from '../maturity/maturity.module';
import { ConversationModule } from './conversation/conversation.module';
import { ProjectToolsModule } from './tools/project-tools.module';
import { DocumentModule } from './documents/document.module';
import { RagCoreModule } from './rag-core.module';
import { ProjectStateModule } from './project-state/project-state.module';
import { VoiceModule } from './voice/voice.module';
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
import { ConversationController } from './controllers/conversation.controller';
import { ProjectStateController } from './project-state/project-state.controller';
import { ProjectContextBuilderService } from './analysis/project-context.service';
import { EvaluationAiService } from './analysis/evaluation-ai.service';
import { CoachingAiService } from './analysis/coaching-ai.service';
import { ImprovementPlannerService } from './analysis/improvement-planner.service';
import { RiskAnalysisService } from './analysis/risk-analysis.service';
import { JuryAiService } from './analysis/jury-ai.service';
import { ProgressAnalysisService } from './analysis/progress-analysis.service';
import { RagPipelineService } from './rag/rag-pipeline.service';
import { ChunkerService } from './rag/chunker.service';
import { RagDocumentPlanBuilder } from './rag/rag-document-plan';
import { AiAnalysisController } from './analysis/ai-analysis.controller';
import { ImprovementPlanController } from './analysis/improvement-plan.controller';
import { RagHealthController } from './controllers/rag-health.controller';

@Module({
  imports: [
    MaturityModule,
    ConversationModule,
    ProjectToolsModule,
    RagCoreModule,
    DocumentModule,
    ProjectStateModule,
    VoiceModule,
  ],
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
    RagPipelineService,
    ChunkerService,
    RagDocumentPlanBuilder,
  ],
  controllers: [
    LlmController,
    SummaryController,
    ReformulationController,
    ChatbotController,
    ConversationController,
    ProjectStateController,
    AiAnalysisController,
    ImprovementPlanController,
    RagHealthController,
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
