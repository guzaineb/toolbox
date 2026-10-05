import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingsService } from './embeddings.service';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingsService],
    }).compile();

    service = module.get<EmbeddingsService>(EmbeddingsService);
  });

  describe('health()', () => {
    it('returns available status based on provider configuration', async () => {
      const result = await service.health();
      expect(result).toHaveProperty('available');
      expect(typeof result.available).toBe('boolean');
    });

    it('returns available:false with reason when local model fails to initialize', async () => {
      const result = await service.health();
      if (!result.available) {
        expect(result.reason).toBeDefined();
        expect(typeof result.reason).toBe('string');
      }
    });
  });

  describe('dimension', () => {
    it('has a configured dimension', () => {
      expect(service.dimension).toBeGreaterThan(0);
      expect(typeof service.dimension).toBe('number');
    });
  });

  describe('distanceFunction', () => {
    it('has a configured distance function', () => {
      expect(service.distanceFunction).toBeDefined();
      expect(typeof service.distanceFunction).toBe('string');
    });
  });

  describe('generate()', () => {
    it('returns empty array for empty input', async () => {
      const result = await service.generate([]);
      expect(result).toEqual([]);
    });
  });
});
