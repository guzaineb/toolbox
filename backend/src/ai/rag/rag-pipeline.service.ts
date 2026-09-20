import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings.service';
import { ChromaService } from '../chroma.service';
import { ChunkerService } from './chunker.service';
import { RagDocumentPlanBuilder, RagDocumentSource } from './rag-document-plan';
import { EMBEDDING_CONFIG, EMBEDDING_DIMENSION } from './rag-config';
import {
  RagIndexResult,
  RagQueryResult,
  RagSource,
  RagStatus,
} from '../interfaces/ai.types';

export interface RagQueryOutcome {
  status: RagStatus;
  documents: RagQueryResult['documents'];
  distances: number[];
  sources: RagSource[];
  reason?: string;
}

/**
 * Pipeline RAG fiable.
 *
 * - Indexation incrémentale : seuls les chunks dont le contenu a changé sont
 *   ré-embarqués (via la table `rag_documents` et le hash de contenu).
 * - Statut explicite : RAG_AVAILABLE / RAG_UNAVAILABLE / NO_RELEVANT_CONTEXT.
 *   ChromaDB indisponible n'est JAMAIS considéré comme un succès silencieux.
 * - Isolation : une collection par projet + filtre `project_id` à la requête.
 * - Complète les données structurées (ProjectContextBuilder), ne les remplace pas.
 */
@Injectable()
export class RagPipelineService {
  private readonly logger = new Logger(RagPipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
    private readonly chroma: ChromaService,
    private readonly chunker: ChunkerService,
    private readonly planBuilder: RagDocumentPlanBuilder,
  ) {}

  /** Indexe (ou ré-indexe incrémentalement) tout le contenu RAG d'un projet. */
  async indexProject(projectId: string): Promise<RagIndexResult> {
    const { sources } = await this.planBuilder.build(projectId);
    if (sources.length === 0) {
      return { added: 0, updated: 0, removed: 0, unchanged: 0, total: 0 };
    }

    const health = await this.chroma.health();
    if (!health.available) {
      throw new Error(
        `ChromaDB indisponible : impossible d'indexer le projet (${health.reason ?? 'injoignable'}).`,
      );
    }
    const embedHealth = await this.embeddings.health();
    if (!embedHealth.available) {
      throw new Error(
        `Embeddings indisponibles : impossible d'indexer le projet (${embedHealth.reason ?? 'inconnu'}).`,
      );
    }

    // État existant de l'index PostgreSQL (par chunk).
    const existing = await this.prisma.ragDocument.findMany({
      where: { project_id: projectId },
    });

    // Construit les chunks à partir du plan.
    const planned: {
      source: RagDocumentSource;
      chunk: {
        id: string;
        content: string;
        chunkIndex: number;
        totalChunks: number;
        contentHash: string;
      };
    }[] = [];
    for (const source of sources) {
      for (const chunk of this.chunker.chunk(
        projectId,
        source.key,
        source.content,
      )) {
        planned.push({ source, chunk });
      }
    }

    const existingMap = new Map<string, (typeof existing)[number]>(
      existing.map((e) => [
        `${e.project_id}|${e.document_key}|${e.chunk_index}`,
        e,
      ]),
    );

    const toAdd: typeof planned = [];
    const toUpdate: typeof planned = [];
    const unchanged: typeof planned = [];
    const plannedKeys = new Set<string>();

    for (const item of planned) {
      const key = `${projectId}|${item.source.key}|${item.chunk.chunkIndex}`;
      plannedKeys.add(key);
      const prev = existingMap.get(key);
      if (!prev) {
        toAdd.push(item);
      } else if (prev.content_hash === item.chunk.contentHash) {
        unchanged.push(item);
      } else {
        toUpdate.push(item);
      }
    }

    // Supprime les chunks du plan (sections retirées).
    const staleRows = existing.filter(
      (e) =>
        !plannedKeys.has(`${e.project_id}|${e.document_key}|${e.chunk_index}`),
    );
    const removedChromaIds = staleRows.map((e) => e.chroma_id);

    // 1) Supprime les entrées obsolètes.
    if (removedChromaIds.length > 0) {
      await this.chroma.deleteDocuments(projectId, removedChromaIds);
    }
    if (staleRows.length > 0) {
      await this.prisma.ragDocument.deleteMany({
        where: { id: { in: staleRows.map((e) => e.id) } },
      });
    }

    // 2) Ajoute les nouveaux chunks.
    if (toAdd.length > 0) {
      const texts = toAdd.map((i) => i.chunk.content);
      const embeddings = await this.embeddings.generate(texts);
      const docs = toAdd.map((i) => ({
        id: i.chunk.id,
        content: i.chunk.content,
        metadata: this.toMetadata(projectId, i.source, i.chunk),
      }));
      await this.chroma.addDocuments(projectId, docs, embeddings);
      await this.prisma.ragDocument.createMany({
        data: toAdd.map((i) => ({
          project_id: projectId,
          document_key: i.source.key,
          chunk_index: i.chunk.chunkIndex,
          chroma_id: i.chunk.id,
          content_hash: i.chunk.contentHash,
          module: i.source.module,
          section: i.source.section,
          source: i.source.source,
          language: i.source.language,
          page: i.source.page ?? null,
          dimension: EMBEDDING_DIMENSION,
          distance_fn: EMBEDDING_CONFIG.distanceFunction,
        })),
      });
    }

    // 3) Met à jour les chunks modifiés.
    if (toUpdate.length > 0) {
      const texts = toUpdate.map((i) => i.chunk.content);
      const embeddings = await this.embeddings.generate(texts);
      const metadatas = toUpdate.map((i) =>
        this.toMetadata(projectId, i.source, i.chunk),
      );
      await this.chroma.updateDocuments(
        projectId,
        toUpdate.map((i) => i.chunk.id),
        toUpdate.map((i) => i.chunk.content),
        embeddings,
        metadatas,
      );
      for (const item of toUpdate) {
        await this.prisma.ragDocument.updateMany({
          where: {
            project_id: projectId,
            document_key: item.source.key,
            chunk_index: item.chunk.chunkIndex,
          },
          data: { content_hash: item.chunk.contentHash },
        });
      }
    }

    const result: RagIndexResult = {
      added: toAdd.length,
      updated: toUpdate.length,
      removed: staleRows.length,
      unchanged: unchanged.length,
      total: planned.length,
    };
    this.logger.log(
      `Index RAG project ${projectId} : +${result.added} modifié ${result.updated} supprimé ${result.removed} inchangé ${result.unchanged}`,
    );
    return result;
  }

  /** Cherche les chunks pertinents pour une question, avec un statut explicite. */
  async query(
    projectId: string,
    question: string,
    nResults = 5,
  ): Promise<RagQueryOutcome> {
    // 1) Health embeddings
    const embedHealth = await this.embeddings.health();
    if (!embedHealth.available) {
      return {
        status: 'RAG_UNAVAILABLE',
        documents: [],
        distances: [],
        sources: [],
        reason: `Embeddings indisponibles : ${embedHealth.reason ?? 'inconnu'}`,
      };
    }

    // 2) Génère l'embedding de la question (dimension verrouillée).
    const queryEmbedding = (await this.embeddings.generate([question]))[0];

    // 3) Health Chroma
    const chromaHealth = await this.chroma.health();
    if (!chromaHealth.available) {
      return {
        status: 'RAG_UNAVAILABLE',
        documents: [],
        distances: [],
        sources: [],
        reason: `ChromaDB indisponible : ${chromaHealth.reason ?? 'injoignable'}`,
      };
    }

    // 4) Requête avec isolation project_id.
    let rag: RagQueryResult;
    try {
      rag = await this.chroma.query(projectId, queryEmbedding, nResults, {
        where: { project_id: projectId },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'RAG_UNAVAILABLE',
        documents: [],
        distances: [],
        sources: [],
        reason: `Échec de la recherche Chroma : ${message}`,
      };
    }

    // 5) Seuil de pertinence (distance cosine, configuré).
    const threshold = EMBEDDING_CONFIG.relevanceThreshold;
    const relevant: Array<{
      doc: RagQueryResult['documents'][0];
      distance: number;
      source: RagSource;
    }> = [];

    for (let i = 0; i < rag.documents.length; i++) {
      const distance = rag.distances[i];
      if (distance <= threshold) {
        const doc = rag.documents[i];
        const meta = doc.metadata ?? {};
        relevant.push({
          doc,
          distance,
          source: {
            id: doc.id,
            documentKey: String(meta.document_key ?? ''),
            module: String(meta.module ?? ''),
            section: String(meta.section ?? ''),
            source: String(meta.source ?? ''),
            page: meta.page != null ? Number(meta.page) : undefined,
            chunkIndex: meta.chunk_index != null ? Number(meta.chunk_index) : 0,
            score: Math.round((1 - distance) * 1000) / 1000,
          },
        });
      }
    }

    if (relevant.length === 0) {
      return {
        status: 'NO_RELEVANT_CONTEXT',
        documents: [],
        distances: [],
        sources: [],
      };
    }

    return {
      status: 'RAG_AVAILABLE',
      documents: relevant.map((r) => r.doc),
      distances: relevant.map((r) => r.distance),
      sources: relevant.map((r) => r.source),
    };
  }

  /** Nombre total de chunks indexés pour un projet. */
  async countIndexed(projectId: string): Promise<number> {
    return this.prisma.ragDocument.count({ where: { project_id: projectId } });
  }

  /** Supprime l'index RAG d'un projet (collection Chroma + table PostgreSQL). */
  async removeIndex(projectId: string): Promise<void> {
    await this.chroma.deleteProjectCollection(projectId);
    await this.prisma.ragDocument.deleteMany({
      where: { project_id: projectId },
    });
  }

  private toMetadata(
    projectId: string,
    source: RagDocumentSource,
    chunk: { chunkIndex: number; totalChunks: number; contentHash: string },
  ): Record<string, any> {
    return {
      project_id: projectId,
      module: source.module,
      section: source.section,
      source: source.source,
      document_key: source.key,
      language: source.language,
      ...(source.page !== undefined ? { page: source.page } : {}),
      chunk_index: chunk.chunkIndex,
      total_chunks: chunk.totalChunks,
      content_hash: chunk.contentHash,
      dimension: EMBEDDING_DIMENSION,
      distance_fn: EMBEDDING_CONFIG.distanceFunction,
    };
  }
}
