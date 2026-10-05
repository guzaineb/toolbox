import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { TextExtractionService } from './text-extraction.service';
import { DocumentController } from '../controllers/document.controller';
import { RagCoreModule } from '../rag-core.module';

@Module({
  imports: [RagCoreModule],
  providers: [DocumentService, TextExtractionService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
