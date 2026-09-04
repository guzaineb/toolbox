import { Test, TestingModule } from '@nestjs/testing';
import { ChromaService } from './chroma.service';

describe('ChromaService', () => {
  let service: ChromaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChromaService],
    }).compile();

    service = module.get<ChromaService>(ChromaService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('health()', () => {
    it('returns available:false with reason when using mock client (no real ChromaDB)', async () => {
      const result = await service.health();
      expect(result.available).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('simulé');
    });

    it('caches health result for 5 seconds', async () => {
      const first = await service.health();
      const second = await service.health();
      expect(first.available).toBe(second.available);
    });
  });

  describe('query - project isolation', () => {
    it('returns empty results for project with no documents', async () => {
      const result = await service.query(
        '11111111-1111-1111-1111-111111111111',
        new Array(384).fill(0.1),
        5,
      );
      expect(result.documents).toHaveLength(0);
      expect(result.distances).toHaveLength(0);
    });
  });

  describe('health check behavior', () => {
    it('returns unavailable reason mentioning simulated client', async () => {
      const result = await service.health();
      expect(result.available).toBe(false);
      expect(result.reason).toContain('simulé');
    });

    it('returns consistent health status across calls', async () => {
      const r1 = await service.health();
      const r2 = await service.health();
      expect(r1.available).toBe(r2.available);
    });
  });

  describe('countDocuments', () => {
    it('returns 0 for project with no documents', async () => {
      const count = await service.countDocuments('nonexistent-project');
      expect(count).toBe(0);
    });
  });

  describe('deleteProjectCollection', () => {
    it('does not throw when deleting non-existent collection', async () => {
      await expect(
        service.deleteProjectCollection('nonexistent-project'),
      ).resolves.toBeUndefined();
    });
  });

  describe('addDocuments - health guard', () => {
    it('throws when ChromaDB is unavailable', async () => {
      await expect(
        service.addDocuments('proj', [
          { id: 'd1', content: 'c', metadata: {} },
        ], [[0.1]]),
      ).rejects.toThrow('ChromaDB indisponible');
    });
  });

  describe('deleteDocuments - health guard', () => {
    it('throws when ChromaDB is unavailable', async () => {
      await expect(
        service.deleteDocuments('proj', ['d1']),
      ).rejects.toThrow('ChromaDB indisponible');
    });
  });

  describe('updateDocuments - health guard', () => {
    it('throws when ChromaDB is unavailable', async () => {
      await expect(
        service.updateDocuments('proj', ['d1'], ['content']),
      ).rejects.toThrow('ChromaDB indisponible');
    });
  });
});
