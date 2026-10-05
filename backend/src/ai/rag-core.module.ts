import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { ChromaService } from './chroma.service';
import { ChunkerService } from './rag/chunker.service';

@Module({
  providers: [EmbeddingsService, ChromaService, ChunkerService],
  exports: [EmbeddingsService, ChromaService, ChunkerService],
})
export class RagCoreModule {}
