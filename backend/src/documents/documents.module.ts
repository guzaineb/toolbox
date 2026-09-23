import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentPromptsService } from './document-prompts.service';
import { DocumentPdfService } from './document-pdf.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentPromptsService, DocumentPdfService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
