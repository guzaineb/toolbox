import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RagDocument, RagQueryResult } from './interfaces/ai.types';
import { EMBEDDING_CONFIG } from './rag/rag-config';

interface ChromaCollection {
  add: (args: {
    ids: string[];
    embeddings: number[][];
    metadatas: Record<string, any>[];
    documents: string[];
  }) => Promise<any>;
  update: (args: {
    ids: string[];
    embeddings?: number[][];
    metadatas?: Record<string, any>[];
    documents?: string[];
  }) => Promise<any>;
  query: (args: {
    queryEmbeddings: number[][];
    nResults: number;
    include: string[];
    where?: Record<string, any>;
  }) => Promise<any>;
  count: () => Promise<number>;
  delete: (args: {
    ids?: string[];
    where?: Record<string, any>;
  }) => Promise<any>;
  get?: (args: { include: string[]; limit?: number }) => Promise<any>;
}

interface ChromaClientInstance {
  getOrCreateCollection: (args: {
    name: string;
    metadata?: Record<string, any>;
  }) => Promise<ChromaCollection>;
  createCollection: (args: {
    name: string;
    metadata?: Record<string, any>;
  }) => Promise<ChromaCollection>;
  deleteCollection: (args: { name: string }) => Promise<void>;
  heartbeat?: () => Promise<number>;
}

@Injectable()
export class ChromaService implements OnModuleDestroy {
  private readonly logger = new Logger(ChromaService.name);
  private client: ChromaClientInstance | null = null;
  private collections = new Map<string, ChromaCollection>();
  private isInitialized = false;
  private realClient = true;
  private lastHealth: { available: boolean; checkedAt: number } = {
    available: false,
    checkedAt: 0,
  };

  async onModuleDestroy() {
    this.collections.clear();
    this.client = null;
    this.isInitialized = false;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    try {
      const { ChromaClient } = await import('chromadb');
      this.client = new ChromaClient({
        path: chromaUrl,
      }) as unknown as ChromaClientInstance;
      this.realClient = true;
      this.logger.log(`ChromaService connected at ${chromaUrl}`);
    } catch {
      this.logger.warn('chromadb package not available. Using mock client.');
      this.client = this.createMockClient();
      this.realClient = false;
    }

    this.isInitialized = true;
  }

  /**
   * Vrai health check : tente un heartbeat réel sur Chroma.
   * Retourne `available: false` si Chroma est injoignable — jamais un faux succès.
   */
  async health(): Promise<{ available: boolean; reason?: string }> {
    await this.ensureInitialized();

    // Cache court (5s) pour ne pas marteler Chroma.
    const now = Date.now();
    if (now - this.lastHealth.checkedAt < 5000) {
      return { available: this.lastHealth.available };
    }

    if (!this.realClient || !this.client || !this.client.heartbeat) {
      this.lastHealth = { available: false, checkedAt: now };
      return {
        available: false,
        reason: 'ChromaDB non disponible (client simulé ou sans heartbeat).',
      };
    }

    try {
      await this.client.heartbeat();
      this.lastHealth = { available: true, checkedAt: now };
      return { available: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastHealth = { available: false, checkedAt: now };
      this.logger.warn(`ChromaDB health check failed: ${message}`);
      return { available: false, reason: `ChromaDB injoignable : ${message}` };
    }
  }

  private createMockClient(): ChromaClientInstance {
    const collections = new Map<string, ChromaCollection>();
    const store = new Map<
      string,
      {
        id: string;
        embedding: number[];
        metadata: Record<string, any>;
        document: string;
      }[]
    >();

    return {
      heartbeat: async () => Date.now(),
      getOrCreateCollection: async ({ name, metadata }) => {
        let col = collections.get(name);
        if (!col) {
          const docs: any[] = [];
          store.set(name, docs);
          col = {
            add: async ({ ids, embeddings, metadatas, documents }) => {
              for (let i = 0; i < ids.length; i++) {
                docs.push({
                  id: ids[i],
                  embedding: embeddings[i],
                  metadata: metadatas[i],
                  document: documents[i],
                });
              }
            },
            update: async ({ ids, embeddings, metadatas, documents }) => {
              for (let i = 0; i < ids.length; i++) {
                const idx = docs.findIndex((d) => d.id === ids[i]);
                if (idx >= 0) {
                  if (embeddings) docs[idx].embedding = embeddings[i];
                  if (metadatas) docs[idx].metadata = metadatas[i];
                  if (documents) docs[idx].document = documents[i];
                }
              }
            },
            query: async ({ queryEmbeddings, nResults, where }) => {
              const filtered = where?.project_id
                ? docs.filter((d) => d.metadata.project_id === where.project_id)
                : docs;
              if (filtered.length === 0) {
                return {
                  ids: [[]],
                  documents: [[]],
                  metadatas: [[]],
                  distances: [[]],
                };
              }
              const sorted = filtered
                .map((d, i) => ({ ...d, index: d.id, distance: 0.3 + (i * 0.1) }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, nResults);
              return {
                ids: [sorted.map((s) => s.id)],
                documents: [sorted.map((s) => s.document)],
                metadatas: [sorted.map((s) => s.metadata)],
                distances: [sorted.map((s) => s.distance)],
              };
            },
            count: async () => docs.length,
            delete: async ({ ids }) => {
              if (ids) {
                for (const id of ids) {
                  const idx = docs.findIndex((d) => d.id === id);
                  if (idx >= 0) docs.splice(idx, 1);
                }
              }
            },
            get: async ({ include, limit }) => {
              const all = docs.slice(0, limit ?? docs.length);
              return {
                ids: all.map((d) => d.id),
                metadatas: all.map((d) => d.metadata),
                documents: include.includes('documents')
                  ? all.map((d) => d.document)
                  : undefined,
              };
            },
          };
          collections.set(name, col);
        }
        return col;
      },
      createCollection: async ({ name }) => {
        if (!collections.has(name)) {
          store.set(name, []);
          collections.set(name, {
            add: async () => {},
            update: async () => {},
            query: async () => ({
              ids: [[]],
              documents: [[]],
              metadatas: [[]],
              distances: [[]],
            }),
            count: async () => 0,
            delete: async () => {},
            get: async () => ({ ids: [], metadatas: [] }),
          });
        }
        return collections.get(name)!;
      },
      deleteCollection: async ({ name }) => {
        collections.delete(name);
        store.delete(name);
      },
    };
  }

  private async getCollection(projectId: string): Promise<ChromaCollection> {
    await this.ensureInitialized();
    const cacheKey = `project_${projectId}`;

    let collection = this.collections.get(cacheKey);
    if (collection) return collection;

    const collectionName = `project_${projectId.replace(/-/g, '_')}`;

    // Vérifie la configuration d'embedding est cohérente avec la collection existante.
    try {
      collection = await this.client!.getOrCreateCollection({
        name: collectionName,
        metadata: {
          project_id: projectId,
          dimension: EMBEDDING_CONFIG.dimension,
          distance_fn: EMBEDDING_CONFIG.distanceFunction,
          model: EMBEDDING_CONFIG.model,
        },
      });
    } catch {
      this.logger.warn(
        `Failed to get/create collection ${collectionName}, trying without existing check`,
      );
      collection = await this.client!.createCollection({
        name: collectionName,
        metadata: {
          project_id: projectId,
          dimension: EMBEDDING_CONFIG.dimension,
          distance_fn: EMBEDDING_CONFIG.distanceFunction,
        },
      });
    }

    await this.verifyCollectionDimension(collection, collectionName);
    this.collections.set(cacheKey, collection);
    return collection;
  }

  /**
   * Vérifie que les vecteurs de la collection ont bien la dimension verrouillée.
   * Si la collection contient des vecteurs d'une autre dimension, on refuse la requête
   * plutôt que de faire une recherche incohérente (RAG_UNAVAILABLE côté appelant).
   */
  private async verifyCollectionDimension(
    collection: ChromaCollection,
    name: string,
  ): Promise<void> {
    try {
      const count = await collection.count();
      if (count <= 0) return;
      if (!collection.get) return;
      const sample = await collection.get({ include: ['metadatas'], limit: 1 });
      const meta = (sample?.metadatas?.[0] ?? {}) as Record<string, any>;
      const storedDimension = Number(meta?.dimension);
      if (storedDimension && storedDimension !== EMBEDDING_CONFIG.dimension) {
        throw new Error(
          `Collection ${name} contient des vecteurs de dimension ${storedDimension}, ` +
            `attendue ${EMBEDDING_CONFIG.dimension}. Réindexez la collection (dimensions incompatibles).`,
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('dimension'))
        throw error;
      // Si le get/lecture échoue (client minimal), on ne bloque pas la lecture courante.
    }
  }

  private collectionName(projectId: string): string {
    return `project_${projectId.replace(/-/g, '_')}`;
  }

  async addDocuments(
    projectId: string,
    documents: RagDocument[],
    embeddings: number[][],
  ): Promise<void> {
    if (documents.length === 0) return;
    if (!(await this.health()).available) {
      throw new Error(
        "ChromaDB indisponible : impossible d'ajouter des documents.",
      );
    }
    const collection = await this.getCollection(projectId);
    await collection.add({
      ids: documents.map((d) => d.id),
      embeddings,
      metadatas: documents.map((d) => d.metadata),
      documents: documents.map((d) => d.content),
    });
    this.logger.log(
      `Added ${documents.length} documents to project ${projectId}`,
    );
  }

  async updateDocuments(
    projectId: string,
    ids: string[],
    documents: string[],
    embeddings?: number[][],
    metadatas?: Record<string, any>[],
  ): Promise<void> {
    if (ids.length === 0) return;
    if (!(await this.health()).available) {
      throw new Error(
        'ChromaDB indisponible : impossible de mettre à jour des documents.',
      );
    }
    const collection = await this.getCollection(projectId);
    await collection.update({
      ids,
      ...(embeddings && { embeddings }),
      ...(metadatas && { metadatas }),
      ...(documents && { documents }),
    });
    this.logger.log(`Updated ${ids.length} documents for project ${projectId}`);
  }

  async deleteDocuments(projectId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    if (!(await this.health()).available) {
      throw new Error(
        'ChromaDB indisponible : impossible de supprimer des documents.',
      );
    }
    const collection = await this.getCollection(projectId);
    await collection.delete({ ids });
    this.logger.log(
      `Deleted ${ids.length} documents from project ${projectId}`,
    );
  }

  /** Retourne l'ensemble des ids + métadonnées stockés (utile pour le diff d'indexation incrémentale). */
  async getAll(
    projectId: string,
  ): Promise<{ id: string; metadata: Record<string, any> }[]> {
    const collection = await this.getCollection(projectId);
    if (!collection.get) return [];
    try {
      const res = await collection.get({ include: ['metadatas'] });
      const ids: string[] = (res?.ids ?? []) as string[];
      const metadatas = (res?.metadatas ?? []) as Record<string, any>[];
      return ids.map((id, i) => ({ id, metadata: metadatas[i] ?? {} }));
    } catch {
      return [];
    }
  }

  async query(
    projectId: string,
    queryEmbedding: number[],
    nResults: number = 5,
    options?: { where?: Record<string, any> },
  ): Promise<RagQueryResult> {
    if (nResults <= 0) return { documents: [], distances: [] };
    if (queryEmbedding.length !== EMBEDDING_CONFIG.dimension) {
      throw new Error(
        `Dimension de la requête (${queryEmbedding.length}) incohérente avec la collection (${EMBEDDING_CONFIG.dimension}).`,
      );
    }
    const collection = await this.getCollection(projectId);
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      include: ['documents', 'metadatas', 'distances'],
      // Isolation par projectId (défense en profondeur, au-delà de la collection dédiée).
      ...(options?.where ?? { where: { project_id: projectId } }),
    });

    const documents: RagDocument[] = (results.documents[0] || []).map(
      (content: string, i: number) => ({
        id: (results.ids[0] || [])[i] || '',
        content: content || '',
        metadata: (results.metadatas[0] || [])[i] || {},
      }),
    );

    const distances = (results.distances[0] || []) as number[];
    return { documents, distances };
  }

  async deleteProjectCollection(projectId: string): Promise<void> {
    const collectionName = this.collectionName(projectId);
    try {
      await this.client!.deleteCollection({ name: collectionName });
      this.collections.delete(`project_${projectId}`);
      this.logger.log(`Deleted collection ${collectionName}`);
    } catch (error: any) {
      this.logger.warn(
        `Failed to delete collection ${collectionName}: ${error.message}`,
      );
    }
  }

  async countDocuments(projectId: string): Promise<number> {
    try {
      const collection = await this.getCollection(projectId);
      return await collection.count();
    } catch {
      return 0;
    }
  }
}
