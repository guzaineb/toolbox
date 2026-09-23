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

@Module({
  providers: [
    AiService,
    LlmService,
    EmbeddingsService,
    ChromaService,
    SummaryService,
    ReformulationService,
    ChatbotService,
  ],
  controllers: [
    LlmController,
    SummaryController,
    ReformulationController,
    ChatbotController,
  ],
  exports: [
    AiService,
    LlmService,
    EmbeddingsService,
    ChromaService,
    SummaryService,
    ReformulationService,
    ChatbotService,
  ],
})
export class AiModule {}
