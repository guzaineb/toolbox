import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ChromaService } from '../chroma.service';
import { EmbeddingsService } from '../embeddings.service';
import { RagPipelineService } from '../rag/rag-pipeline.service';

type RequestUser = { user: { id: string } };

@Controller('ai/rag')
@UseGuards(JwtAuthGuard)
export class RagHealthController {
  constructor(
    private readonly chroma: ChromaService,
    private readonly embeddings: EmbeddingsService,
    private readonly rag: RagPipelineService,
    private readonly access: ModuleAccessService,
  ) {}

  @Get('health')
  async health(
    @Query('projectId') projectId: string,
    @Req() req: RequestUser,
  ) {
    await this.access.assertCanAccessProject(projectId, req.user.id);

    const [chromaHealth, embeddingsHealth, indexedCount] = await Promise.all([
      this.chroma.health(),
      this.embeddings.health(),
      this.rag.countIndexed(projectId),
    ]);

    return {
      success: true,
      data: {
        embeddings: embeddingsHealth,
        chroma: chromaHealth,
        indexedCount,
        overall:
          chromaHealth.available && embeddingsHealth.available
            ? 'healthy'
            : 'degraded',
      },
    };
  }
}
