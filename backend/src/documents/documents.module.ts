import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentPromptsService } from './document-prompts.service';
import { DocumentPdfService } from './document-pdf.service';
import { AiModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [AiModule, ProjectsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentPromptsService, DocumentPdfService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
