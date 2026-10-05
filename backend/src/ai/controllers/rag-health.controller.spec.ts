import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { RagHealthController } from './rag-health.controller';
import { ChromaService } from '../chroma.service';
import { EmbeddingsService } from '../embeddings.service';
import { RagPipelineService } from '../rag/rag-pipeline.service';

describe('RagHealthController', () => {
  let controller: RagHealthController;

  const accessMock = {
    assertCanAccessProject: jest.fn(),
  };

  const chromaMock = {
    health: jest.fn(),
  };

  const embeddingsMock = {
    health: jest.fn(),
  };

  const ragMock = {
    countIndexed: jest.fn(),
  };

  const req = (userId: string): { user: { id: string } } => ({
    user: { id: userId },
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    accessMock.assertCanAccessProject.mockResolvedValue(undefined);
    chromaMock.health.mockResolvedValue({ available: true });
    embeddingsMock.health.mockResolvedValue({ available: true });
    ragMock.countIndexed.mockResolvedValue(12);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RagHealthController],
      providers: [
        { provide: ModuleAccessService, useValue: accessMock },
        { provide: ChromaService, useValue: chromaMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: RagPipelineService, useValue: ragMock },
      ],
    }).compile();

    controller = module.get<RagHealthController>(RagHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('is protected by JwtAuthGuard', () => {
    const guards = Reflect.getMetadata('__guards__', RagHealthController) as
      | Array<{ name?: string } | (new (...args: any[]) => unknown)>
      | undefined;
    expect(guards).toBeDefined();
    expect(guards?.some((g) => (g as any) === JwtAuthGuard)).toBe(true);
  });

  describe('GET /ai/rag/health', () => {
    it('returns healthy status when both embeddings and chroma are available', async () => {
      const result = await controller.health('proj-1', req('user-1'));

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith('proj-1', 'user-1');
      expect(chromaMock.health).toHaveBeenCalled();
      expect(embeddingsMock.health).toHaveBeenCalled();
      expect(ragMock.countIndexed).toHaveBeenCalledWith('proj-1');

      expect(result.success).toBe(true);
      expect(result.data.overall).toBe('healthy');
      expect(result.data.embeddings).toEqual({ available: true });
      expect(result.data.chroma).toEqual({ available: true });
      expect(result.data.indexedCount).toBe(12);
    });

    it('returns degraded status when chroma is unavailable', async () => {
      chromaMock.health.mockResolvedValue({ available: false, reason: 'Chroma down' });

      const result = await controller.health('proj-1', req('user-1'));

      expect(result.data.overall).toBe('degraded');
      expect(result.data.chroma.available).toBe(false);
      expect(result.data.chroma.reason).toContain('Chroma down');
    });

    it('returns degraded status when embeddings are unavailable', async () => {
      embeddingsMock.health.mockResolvedValue({ available: false, reason: 'No model' });

      const result = await controller.health('proj-1', req('user-1'));

      expect(result.data.overall).toBe('degraded');
      expect(result.data.embeddings.available).toBe(false);
      expect(result.data.embeddings.reason).toContain('No model');
    });

    it('returns degraded status when both are unavailable', async () => {
      chromaMock.health.mockResolvedValue({ available: false, reason: 'Chroma down' });
      embeddingsMock.health.mockResolvedValue({ available: false, reason: 'No model' });

      const result = await controller.health('proj-1', req('user-1'));

      expect(result.data.overall).toBe('degraded');
      expect(result.data.embeddings.available).toBe(false);
      expect(result.data.chroma.available).toBe(false);
    });

    it('rejects unauthorized user (BOLA protection)', async () => {
      accessMock.assertCanAccessProject.mockRejectedValue(
        new ForbiddenException('Accès refusé'),
      );

      await expect(
        controller.health('proj-1', req('other-user')),
      ).rejects.toThrow(ForbiddenException);
      expect(chromaMock.health).not.toHaveBeenCalled();
      expect(embeddingsMock.health).not.toHaveBeenCalled();
    });

    it('returns indexed count of 0 when no documents indexed', async () => {
      ragMock.countIndexed.mockResolvedValue(0);

      const result = await controller.health('proj-1', req('user-1'));

      expect(result.data.indexedCount).toBe(0);
      expect(result.data.overall).toBe('healthy');
    });
  });
});
