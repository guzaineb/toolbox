import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { DeepseekService } from './deepseek.service';
import { RagService } from './rag.service';
import { SummaryService } from './summary.service';
import { ReformulationService } from './reformulation.service';
import { ChatbotService } from './chatbot.service';
import { DeepseekController } from './controllers/deepseek.controller';
import { SummaryController } from './controllers/summary.controller';
import { ReformulationController } from './controllers/reformulation.controller';
import { ChatbotController } from './controllers/chatbot.controller';

@Module({
  providers: [
    AiService,
    DeepseekService,
    RagService,
    SummaryService,
    ReformulationService,
    ChatbotService,
  ],
  controllers: [
    DeepseekController,
    SummaryController,
    ReformulationController,
    ChatbotController,
  ],
  exports: [
    AiService,
    DeepseekService,
    RagService,
    SummaryService,
    ReformulationService,
    ChatbotService,
  ],
})
export class AiModule {}
