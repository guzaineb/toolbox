import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { TextExtractionService } from './text-extraction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { EmbeddingsService } from '../embeddings.service';
import { ChromaService } from '../chroma.service';
import { ChunkerService } from '../rag/chunker.service';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  copyFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('test content')),
  unlinkSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = 'user-1';
const DOC_ID = 'doc-123';

const mockDocument = {
  id: DOC_ID,
  project_id: PROJECT_ID,
  owner_id: USER_ID,
  filename: `${DOC_ID}.txt`,
  original_name: 'test.txt',
  mime_type: 'text/plain',
  size: 1024,
  status: 'INDEXED',
  error_message: null,
  chunk_count: 3,
  created_at: new Date(),
  indexed_at: new Date(),
};

describe('DocumentService', () => {
  let service: DocumentService;

  const accessMock = {
    assertCanAccessProject: jest.fn().mockResolvedValue(undefined),
  };

  const prismaMock = {
    uploadedDocument: {
      create: jest.fn().mockResolvedValue(mockDocument),
      findUnique: jest.fn().mockResolvedValue(mockDocument),
      update: jest.fn().mockResolvedValue(mockDocument),
      delete: jest.fn().mockResolvedValue(mockDocument),
      findMany: jest.fn().mockResolvedValue([mockDocument]),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  const embeddingsMock = {
    generate: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  };

  const chromaMock = {
    addDocuments: jest.fn().mockResolvedValue(undefined),
    deleteDocuments: jest.fn().mockResolvedValue(undefined),
    getAll: jest.fn().mockResolvedValue([
      { id: `${PROJECT_ID}_upload.${DOC_ID}_0`, metadata: {} },
      { id: `${PROJECT_ID}_upload.${DOC_ID}_1`, metadata: {} },
    ]),
  };

  const chunkerMock = {
    chunk: jest.fn().mockReturnValue([
      { id: 'chunk-0', content: 'chunk content 0', chunkIndex: 0, totalChunks: 2, contentHash: 'hash0' },
      { id: 'chunk-1', content: 'chunk content 1', chunkIndex: 1, totalChunks: 2, contentHash: 'hash1' },
    ]),
  };

  const textExtractorMock = {
    extract: jest.fn().mockResolvedValue({ text: 'Extracted text content for testing', pageCount: 1 }),
    isSupported: jest.fn().mockReturnValue(true),
    isSupportedByExtension: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    accessMock.assertCanAccessProject.mockReset();
    prismaMock.uploadedDocument.create.mockReset();
    prismaMock.uploadedDocument.findUnique.mockReset();
    prismaMock.uploadedDocument.update.mockReset();
    prismaMock.uploadedDocument.delete.mockReset();
    prismaMock.uploadedDocument.findMany.mockReset();
    prismaMock.uploadedDocument.count.mockReset();
    embeddingsMock.generate.mockReset();
    chromaMock.addDocuments.mockReset();
    chromaMock.deleteDocuments.mockReset();
    chromaMock.getAll.mockReset();
    chunkerMock.chunk.mockReset();
    textExtractorMock.extract.mockReset();
    textExtractorMock.isSupported.mockReset();
    textExtractorMock.isSupportedByExtension.mockReset();

    accessMock.assertCanAccessProject.mockResolvedValue(undefined);
    prismaMock.uploadedDocument.findUnique.mockResolvedValue(mockDocument);
    prismaMock.uploadedDocument.create.mockResolvedValue(mockDocument);
    prismaMock.uploadedDocument.update.mockResolvedValue(mockDocument);
    prismaMock.uploadedDocument.findMany.mockResolvedValue([mockDocument]);
    prismaMock.uploadedDocument.count.mockResolvedValue(1);
    embeddingsMock.generate.mockResolvedValue([[0.1, 0.2, 0.3]]);
    chromaMock.addDocuments.mockResolvedValue(undefined);
    chromaMock.deleteDocuments.mockResolvedValue(undefined);
    chromaMock.getAll.mockResolvedValue([
      { id: `${PROJECT_ID}_upload.${DOC_ID}_0`, metadata: {} },
    ]);
    chunkerMock.chunk.mockReturnValue([
      { id: 'chunk-0', content: 'chunk content 0', chunkIndex: 0, totalChunks: 2, contentHash: 'hash0' },
      { id: 'chunk-1', content: 'chunk content 1', chunkIndex: 1, totalChunks: 2, contentHash: 'hash1' },
    ]);
    textExtractorMock.extract.mockResolvedValue({ text: 'Extracted text content for testing', pageCount: 1 });
    textExtractorMock.isSupported.mockReturnValue(true);
    textExtractorMock.isSupportedByExtension.mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ModuleAccessService, useValue: accessMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: ChromaService, useValue: chromaMock },
        { provide: ChunkerService, useValue: chunkerMock },
        { provide: TextExtractionService, useValue: textExtractorMock },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('creates document record and saves file', async () => {
      const mockFile = {
        path: '/tmp/test-upload.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
      } as Express.Multer.File;

      const result = await service.upload(PROJECT_ID, USER_ID, mockFile as any);

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
      expect(prismaMock.uploadedDocument.create).toHaveBeenCalled();
      expect(result.status).toBe('INDEXED');
    });
  });

  describe('indexDocument', () => {
    it('extracts text, chunks, embeds, and stores in ChromaDB', async () => {
      const result = await service.indexDocument(DOC_ID, PROJECT_ID, USER_ID);

      expect(accessMock.assertCanAccessProject).toHaveBeenCalledWith(PROJECT_ID, USER_ID);
      expect(textExtractorMock.extract).toHaveBeenCalled();
      expect(chunkerMock.chunk).toHaveBeenCalled();
      expect(embeddingsMock.generate).toHaveBeenCalled();
      expect(chromaMock.addDocuments).toHaveBeenCalled();
      expect(prismaMock.uploadedDocument.update).toHaveBeenCalled();
      expect(result.chunksIndexed).toBe(2);
    });

    it('rejects when document belongs to different project', async () => {
      prismaMock.uploadedDocument.findUnique.mockResolvedValue({
        ...mockDocument,
        project_id: 'other-project',
      });

      await expect(
        service.indexDocument(DOC_ID, PROJECT_ID, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects when user is not document owner', async () => {
      prismaMock.uploadedDocument.findUnique.mockResolvedValue({
        ...mockDocument,
        owner_id: 'other-user',
      });

      await expect(
        service.indexDocument(DOC_ID, PROJECT_ID, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('handles extraction failure gracefully', async () => {
      textExtractorMock.extract.mockRejectedValue(new Error('Extraction failed'));

      const result = await service.indexDocument(DOC_ID, PROJECT_ID, USER_ID);

      expect(result.chunksIndexed).toBe(0);
      expect(prismaMock.uploadedDocument.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('returns 0 chunks for empty content', async () => {
      textExtractorMock.extract.mockResolvedValue({ text: '' });

      const result = await service.indexDocument(DOC_ID, PROJECT_ID, USER_ID);

      expect(result.chunksIndexed).toBe(0);
    });
  });

  describe('deleteDocument', () => {
    it('removes from ChromaDB, filesystem, and database', async () => {
      await service.deleteDocument(DOC_ID, PROJECT_ID, USER_ID);

      expect(chromaMock.deleteDocuments).toHaveBeenCalled();
      expect(prismaMock.uploadedDocument.delete).toHaveBeenCalled();
    });

    it('rejects when document not found', async () => {
      prismaMock.uploadedDocument.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteDocument(DOC_ID, PROJECT_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects when document belongs to different project', async () => {
      prismaMock.uploadedDocument.findUnique.mockResolvedValue({
        ...mockDocument,
        project_id: 'other-project',
      });

      await expect(
        service.deleteDocument(DOC_ID, PROJECT_ID, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reindexDocument', () => {
    it('cleans old chunks then re-indexes', async () => {
      chromaMock.getAll.mockResolvedValue([
        { id: `${PROJECT_ID}_upload.${DOC_ID}_0`, metadata: {} },
      ]);

      const result = await service.reindexDocument(DOC_ID, PROJECT_ID, USER_ID);

      expect(chromaMock.deleteDocuments).toHaveBeenCalled();
      expect(result.chunksIndexed).toBe(2);
    });
  });

  describe('listByProject', () => {
    it('returns paginated documents', async () => {
      const result = await service.listByProject(PROJECT_ID, USER_ID, 1, 10);

      expect(result.documents).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getById', () => {
    it('returns document by id', async () => {
      const result = await service.getById(DOC_ID, PROJECT_ID, USER_ID);

      expect(result.id).toBe(DOC_ID);
      expect(result.originalName).toBe('test.txt');
    });

    it('rejects when not found', async () => {
      prismaMock.uploadedDocument.findUnique.mockResolvedValue(null);

      await expect(
        service.getById(DOC_ID, PROJECT_ID, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('isolation', () => {
    it('userId from server, never from client', async () => {
      await service.upload(PROJECT_ID, 'server-user', {
        path: '/tmp/test.txt',
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 100,
      } as any);

      expect(prismaMock.uploadedDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ owner_id: 'server-user' }),
        }),
      );
    });
  });
});
