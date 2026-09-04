import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { EmbeddingsService } from '../embeddings.service';
import { ChromaService } from '../chroma.service';
import { ChunkerService } from '../rag/chunker.service';
import { TextExtractionService } from './text-extraction.service';
import { EMBEDDING_DIMENSION, EMBEDDING_DISTANCE_FUNCTION } from '../rag/rag-config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'ai-documents');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface UploadedDocumentResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: Date;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly embeddings: EmbeddingsService,
    private readonly chroma: ChromaService,
    private readonly chunker: ChunkerService,
    private readonly textExtractor: TextExtractionService,
  ) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(
    projectId: string,
    ownerId: string,
    file: Express.Multer.File,
  ): Promise<UploadedDocumentResult> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    if (file.size > MAX_FILE_SIZE) {
      throw new ForbiddenException(`Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    if (!this.textExtractor.isSupported(file.mimetype) && !this.textExtractor.isSupportedByExtension(file.originalname)) {
      throw new ForbiddenException(
        'Format non supporté. Formats acceptés: PDF, DOCX, TXT, MD',
      );
    }

    const docId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${docId}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.copyFileSync(file.path, filepath);

    const document = await this.prisma.uploadedDocument.create({
      data: {
        id: docId,
        project_id: projectId,
        owner_id: ownerId,
        filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        status: 'PENDING',
      },
    });

    this.logger.log(`Document uploaded: ${document.id} (${file.originalname}) for project ${projectId}`);

    return {
      id: document.id,
      filename: document.filename,
      originalName: document.original_name,
      mimeType: document.mime_type,
      size: document.size,
      status: document.status,
      createdAt: document.created_at,
    };
  }

  async indexDocument(documentId: string, projectId: string, ownerId: string): Promise<{ chunksIndexed: number }> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    const document = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    if (document.project_id !== projectId) {
      throw new ForbiddenException('Ce document n\'appartient pas à ce projet');
    }
    if (document.owner_id !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à indexer ce document');
    }

    await this.prisma.uploadedDocument.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    try {
      const filepath = path.join(UPLOAD_DIR, document.filename);
      if (!fs.existsSync(filepath)) {
        throw new Error('Fichier physique introuvable sur le serveur');
      }

      const extracted = await this.textExtractor.extract(filepath, document.mime_type);

      if (!extracted.text || extracted.text.trim().length < 10) {
        await this.prisma.uploadedDocument.update({
          where: { id: documentId },
          data: { status: 'FAILED', error_message: 'Contenu texte insuffisant ou vide' },
        });
        return { chunksIndexed: 0 };
      }

      const documentKey = `upload.${documentId}`;
      const chunks = this.chunker.chunk(projectId, documentKey, extracted.text);

      if (chunks.length === 0) {
        await this.prisma.uploadedDocument.update({
          where: { id: documentId },
          data: { status: 'INDEXED', chunk_count: 0, indexed_at: new Date() },
        });
        return { chunksIndexed: 0 };
      }

      const texts = chunks.map((c) => c.content);
      const embeddings = await this.embeddings.generate(texts);

      const chromaDocs = chunks.map((c, i) => ({
        id: c.id,
        content: c.content,
        metadata: {
          project_id: projectId,
          document_id: documentId,
          module: 'uploads',
          source: `upload.${document.original_name}`,
          page: 1,
          chunk_index: c.chunkIndex,
          total_chunks: c.totalChunks,
          language: 'fr',
          document_key: documentKey,
          content_hash: c.contentHash,
          dimension: EMBEDDING_DIMENSION,
          distance_fn: EMBEDDING_DISTANCE_FUNCTION,
        },
      }));

      await this.chroma.addDocuments(projectId, chromaDocs, embeddings);

      await this.prisma.uploadedDocument.update({
        where: { id: documentId },
        data: {
          status: 'INDEXED',
          chunk_count: chunks.length,
          indexed_at: new Date(),
        },
      });

      this.logger.log(
        `Document ${documentId} indexed: ${chunks.length} chunks for project ${projectId}`,
      );

      return { chunksIndexed: chunks.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Indexing failed for document ${documentId}: ${message}`);

      await this.prisma.uploadedDocument.update({
        where: { id: documentId },
        data: { status: 'FAILED', error_message: message },
      });

      return { chunksIndexed: 0 };
    }
  }

  async deleteDocument(documentId: string, projectId: string, ownerId: string): Promise<void> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    const document = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    if (document.project_id !== projectId) {
      throw new ForbiddenException('Ce document n\'appartient pas à ce projet');
    }
    if (document.owner_id !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce document');
    }

    const documentKey = `upload.${documentId}`;

    try {
      const allDocs = await this.chroma.getAll(projectId);
      const idsToDelete = allDocs
        .filter((d) => d.id.startsWith(`${projectId}_${documentKey}_`))
        .map((d) => d.id);
      if (idsToDelete.length > 0) {
        await this.chroma.deleteDocuments(projectId, idsToDelete);
      }
    } catch (error) {
      this.logger.warn(`ChromaDB cleanup failed for ${documentId}: ${error}`);
    }

    const filepath = path.join(UPLOAD_DIR, document.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await this.prisma.uploadedDocument.delete({
      where: { id: documentId },
    });

    this.logger.log(`Document ${documentId} deleted from project ${projectId}`);
  }

  async reindexDocument(documentId: string, projectId: string, ownerId: string): Promise<{ chunksIndexed: number }> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    const document = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    if (document.project_id !== projectId) {
      throw new ForbiddenException('Ce document n\'appartient pas à ce projet');
    }
    if (document.owner_id !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à réindexer ce document');
    }

    const documentKey = `upload.${documentId}`;
    try {
      const allDocs = await this.chroma.getAll(projectId);
      const idsToDelete = allDocs
        .filter((d) => d.id.startsWith(`${projectId}_${documentKey}_`))
        .map((d) => d.id);
      if (idsToDelete.length > 0) {
        await this.chroma.deleteDocuments(projectId, idsToDelete);
      }
    } catch (error) {
      this.logger.warn(`ChromaDB cleanup before reindex failed: ${error}`);
    }

    return this.indexDocument(documentId, projectId, ownerId);
  }

  async listByProject(
    projectId: string,
    ownerId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    documents: UploadedDocumentResult[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    const where = { project_id: projectId, owner_id: ownerId };
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.uploadedDocument.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.uploadedDocument.count({ where }),
    ]);

    return {
      documents: documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        originalName: d.original_name,
        mimeType: d.mime_type,
        size: d.size,
        status: d.status,
        createdAt: d.created_at,
      })),
      total,
      page,
      limit,
      hasMore: skip + documents.length < total,
    };
  }

  async getById(documentId: string, projectId: string, ownerId: string): Promise<UploadedDocumentResult> {
    await this.access.assertCanAccessProject(projectId, ownerId);

    const document = await this.prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }
    if (document.project_id !== projectId) {
      throw new ForbiddenException('Ce document n\'appartient pas à ce projet');
    }
    if (document.owner_id !== ownerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à voir ce document');
    }

    return {
      id: document.id,
      filename: document.filename,
      originalName: document.original_name,
      mimeType: document.mime_type,
      size: document.size,
      status: document.status,
      createdAt: document.created_at,
    };
  }
}
