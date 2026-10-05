import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings.service';
import { ChromaService } from '../chroma.service';
import { ChunkerService } from './chunker.service';
import { RagDocumentPlanBuilder } from './rag-document-plan';
import { RagPipelineService } from './rag-pipeline.service';
import { RagDocument } from '../interfaces/ai.types';

describe('RagPipelineService', () => {
  let service: RagPipelineService;

  const prismaMock = {
    ragDocument: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const embeddingsMock = {
    health: jest.fn(),
    generate: jest.fn(),
  };
  const chromaMock = {
    health: jest.fn(),
    query: jest.fn(),
    addDocuments: jest.fn(),
    updateDocuments: jest.fn(),
    deleteDocuments: jest.fn(),
    deleteProjectCollection: jest.fn(),
  };
  const chunkerMock = {
    chunk: jest.fn(),
  };
  const planMock = {
    build: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagPipelineService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: ChromaService, useValue: chromaMock },
        { provide: ChunkerService, useValue: chunkerMock },
        { provide: RagDocumentPlanBuilder, useValue: planMock },
      ],
    }).compile();

    service = module.get<RagPipelineService>(RagPipelineService);
  });

  const makeDoc = (id: string, content: string, distance: number): RagDocument => ({
    id,
    content,
    metadata: {
      project_id: 'p1',
      document_key: 'gbm1.idea',
      module: 'gbm',
      section: 'Idée initiale',
      source: 'gbm',
      language: 'fr',
      chunk_index: 0,
    },
  });

  describe('query', () => {
    it('retourne RAG_UNAVAILABLE quand les embeddings sont indisponibles', async () => {
      embeddingsMock.health.mockResolvedValue({ available: false, reason: 'modèle absent' });

      const out = await service.query('p1', 'question');
      expect(out.status).toBe('RAG_UNAVAILABLE');
      expect(out.documents).toEqual([]);
      expect(out.reason).toContain('modèle absent');
      expect(chromaMock.query).not.toHaveBeenCalled();
    });

    it('retourne RAG_UNAVAILABLE quand ChromaDB est indisponible', async () => {
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2]]);
      chromaMock.health.mockResolvedValue({ available: false, reason: 'Chroma down' });

      const out = await service.query('p1', 'question');
      expect(out.status).toBe('RAG_UNAVAILABLE');
      expect(out.reason).toContain('Chroma down');
    });

    it('retourne NO_RELEVANT_CONTEXT quand toutes les distances dépassent le seuil', async () => {
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2]]);
      chromaMock.health.mockResolvedValue({ available: true });
      chromaMock.query.mockResolvedValue({
        documents: [makeDoc('a', 'x', 0.9)],
        distances: [0.9],
      });

      const out = await service.query('p1', 'question');
      expect(out.status).toBe('NO_RELEVANT_CONTEXT');
      expect(out.sources).toEqual([]);
    });

    it('isole la requête par project_id (filtre where appliqué)', async () => {
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2]]);
      chromaMock.health.mockResolvedValue({ available: true });
      chromaMock.query.mockResolvedValue({
        documents: [makeDoc('a', 'contenu', 0.2)],
        distances: [0.2],
      });

      await service.query('p1', 'question');
      expect(chromaMock.query).toHaveBeenCalledWith(
        'p1',
        [0.1, 0.2],
        5,
        { where: { project_id: 'p1' } },
      );
    });

    it('retourne RAG_AVAILABLE avec sources pertinentes sous le seuil', async () => {
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2]]);
      chromaMock.health.mockResolvedValue({ available: true });
      chromaMock.query.mockResolvedValue({
        documents: [makeDoc('c1', 'contenu utile', 0.15)],
        distances: [0.15],
      });

      const out = await service.query('p1', 'question');
      expect(out.status).toBe('RAG_AVAILABLE');
      expect(out.sources).toHaveLength(1);
      expect(out.sources[0].id).toBe('c1');
      expect(out.sources[0].documentKey).toBe('gbm1.idea');
      expect(out.sources[0].module).toBe('gbm');
      expect(out.sources[0].score).toBe(Math.round((1 - 0.15) * 1000) / 1000);
    });
  });

  describe('indexProject', () => {
    it('retourne un résultat vide quand le plan n’a aucune source', async () => {
      planMock.build.mockResolvedValue({ projectId: 'p1', sources: [] });
      const result = await service.indexProject('p1');
      expect(result).toEqual({ added: 0, updated: 0, removed: 0, unchanged: 0, total: 0 });
      expect(chromaMock.health).not.toHaveBeenCalled();
    });

    it('lève une erreur explicite quand ChromaDB est indisponible', async () => {
      planMock.build.mockResolvedValue({
        projectId: 'p1',
        sources: [{ key: 'k', module: 'm', section: 's', source: 'src', language: 'fr', content: 'abc' }],
      });
      chromaMock.health.mockResolvedValue({ available: false, reason: 'down' });

      await expect(service.indexProject('p1')).rejects.toThrow(/ChromaDB indisponible/);
      expect(embeddingsMock.generate).not.toHaveBeenCalled();
    });

    it('lève une erreur explicite quand les embeddings sont indisponibles', async () => {
      planMock.build.mockResolvedValue({
        projectId: 'p1',
        sources: [{ key: 'k', module: 'm', section: 's', source: 'src', language: 'fr', content: 'abc' }],
      });
      chromaMock.health.mockResolvedValue({ available: true });
      embeddingsMock.health.mockResolvedValue({ available: false, reason: 'no model' });

      await expect(service.indexProject('p1')).rejects.toThrow(/Embeddings indisponibles/);
      expect(chromaMock.addDocuments).not.toHaveBeenCalled();
    });

    it('diff incrémental : ajoute les nouveaux, conserve inchangés, supprime les obsolètes', async () => {
      planMock.build.mockResolvedValue({
        projectId: 'p1',
        sources: [{ key: 'k', module: 'm', section: 's', source: 'src', language: 'fr', content: 'nouveau contenu' }],
      });
      chromaMock.health.mockResolvedValue({ available: true });
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2, 0.3]]);

      // État existant : un chunk inchangé (même hash) + un chunk obsolète (supprimé du plan).
      const unchangedHash = 'abc123';
      prismaMock.ragDocument.findMany.mockResolvedValue([
        {
          id: 'row1',
          project_id: 'p1',
          document_key: 'k.unchanged',
          chunk_index: 0,
          chroma_id: 'p1_k.unchanged_0',
          content_hash: unchangedHash,
        },
        {
          id: 'row2',
          project_id: 'p1',
          document_key: 'k.stale',
          chunk_index: 0,
          chroma_id: 'p1_k.stale_0',
          content_hash: 'stalehash',
        },
      ]);

      // Le plan génère 2 chunks : un inchangé + un nouveau.
      chunkerMock.chunk.mockImplementation(
        (_p: string, docKey: string) =>
          docKey === 'k.unchanged'
            ? [{ id: 'p1_k.unchanged_0', content: 'x', chunkIndex: 0, totalChunks: 1, contentHash: unchangedHash }]
            : [{ id: 'p1_k.new_0', content: 'y', chunkIndex: 0, totalChunks: 1, contentHash: 'newhash' }],
      );

      const sources = [
        { key: 'k.unchanged', module: 'm', section: 's', source: 'src', language: 'fr', content: 'x' },
        { key: 'k.new', module: 'm', section: 's', source: 'src', language: 'fr', content: 'y' },
      ];
      planMock.build.mockResolvedValue({ projectId: 'p1', sources });

      const result = await service.indexProject('p1');

      expect(result.added).toBe(1); // k.new
      expect(result.unchanged).toBe(1); // k.unchanged
      expect(result.removed).toBe(1); // k.stale
      // Suppression des obsolètes de Chroma + de la table
      expect(chromaMock.deleteDocuments).toHaveBeenCalledWith('p1', ['p1_k.stale_0']);
      expect(prismaMock.ragDocument.deleteMany).toHaveBeenCalled();
      // Ajout des nouveaux
      expect(chromaMock.addDocuments).toHaveBeenCalled();
      expect(prismaMock.ragDocument.createMany).toHaveBeenCalled();
      // Pas d'appel updateDocuments (aucun chunk modifié)
      expect(chromaMock.updateDocuments).not.toHaveBeenCalled();
    });

    it('met à jour les chunks dont le contenu a changé (updateDocuments)', async () => {
      planMock.build.mockResolvedValue({
        projectId: 'p1',
        sources: [{ key: 'k', module: 'm', section: 's', source: 'src', language: 'fr', content: 'nouveau' }],
      });
      chromaMock.health.mockResolvedValue({ available: true });
      embeddingsMock.health.mockResolvedValue({ available: true });
      embeddingsMock.generate.mockResolvedValue([[0.1, 0.2, 0.3]]);

      prismaMock.ragDocument.findMany.mockResolvedValue([
        {
          id: 'row1',
          project_id: 'p1',
          document_key: 'k',
          chunk_index: 0,
          chroma_id: 'p1_k_0',
          content_hash: 'ancien-hash',
        },
      ]);
      chunkerMock.chunk.mockReturnValue([
        { id: 'p1_k_0', content: 'nouveau', chunkIndex: 0, totalChunks: 1, contentHash: 'nouveau-hash' },
      ]);

      const result = await service.indexProject('p1');
      expect(result.updated).toBe(1);
      expect(chromaMock.updateDocuments).toHaveBeenCalled();
      expect(prismaMock.ragDocument.updateMany).toHaveBeenCalled();
    });
  });

  describe('countIndexed / removeIndex', () => {
    it('remonte le nombre de chunks PostgreSQL', async () => {
      prismaMock.ragDocument.count.mockResolvedValue(7);
      await expect(service.countIndexed('p1')).resolves.toBe(7);
      expect(prismaMock.ragDocument.count).toHaveBeenCalledWith({ where: { project_id: 'p1' } });
    });

    it('supprime l’index : collection Chroma + table PostgreSQL', async () => {
      await service.removeIndex('p1');
      expect(chromaMock.deleteProjectCollection).toHaveBeenCalledWith('p1');
      expect(prismaMock.ragDocument.deleteMany).toHaveBeenCalledWith({ where: { project_id: 'p1' } });
    });
  });
});
