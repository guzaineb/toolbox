import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RagDocument, RagQueryResult } from './interfaces/ai.types';

interface ChromaCollection {
  add: (args: { ids: string[]; embeddings: number[][]; metadatas: Record<string, any>[]; documents: string[] }) => Promise<any>;
  update: (args: { ids: string[]; embeddings?: number[][]; metadatas?: Record<string, any>[]; documents?: string[] }) => Promise<any>;
  query: (args: { queryEmbeddings: number[][]; nResults: number; include: string[] }) => Promise<any>;
  count: () => Promise<number>;
  delete: (args: { ids?: string[] }) => Promise<any>;
}

interface ChromaClientInstance {
  getOrCreateCollection: (args: { name: string; metadata?: Record<string, any> }) => Promise<ChromaCollection>;
  createCollection: (args: { name: string; metadata?: Record<string, any> }) => Promise<ChromaCollection>;
  deleteCollection: (args: { name: string }) => Promise<void>;
}

@Injectable()
export class ChromaService implements OnModuleDestroy {
  private readonly logger = new Logger(ChromaService.name);
  private client: ChromaClientInstance | null = null;
  private collections = new Map<string, ChromaCollection>();
  private isInitialized = false;

  async onModuleDestroy() {
    this.collections.clear();
    this.client = null;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    try {
      const { ChromaClient } = await import('chromadb');
      this.client = new ChromaClient({ path: chromaUrl }) as unknown as ChromaClientInstance;
      this.logger.log(`ChromaService connected at ${chromaUrl}`);
    } catch {
      this.logger.warn('chromadb package not available. Using mock client.');
      this.client = this.createMockClient();
    }

    this.isInitialized = true;
  }

  private createMockClient(): ChromaClientInstance {
    const collections = new Map<string, ChromaCollection>();
    const store = new Map<string, { id: string; embedding: number[]; metadata: Record<string, any>; document: string }[]>();

    return {
      getOrCreateCollection: async ({ name, metadata }) => {
        let col = collections.get(name);
        if (!col) {
          const docs: any[] = [];
          store.set(name, docs);
          col = {
            add: async ({ ids, embeddings, metadatas, documents }) => {
              for (let i = 0; i < ids.length; i++) {
                docs.push({ id: ids[i], embedding: embeddings[i], metadata: metadatas[i], document: documents[i] });
              }
            },
            update: async ({ ids, embeddings, metadatas, documents }) => {
              for (let i = 0; i < ids.length; i++) {
                const idx = docs.findIndex(d => d.id === ids[i]);
                if (idx >= 0) {
                  if (embeddings) docs[idx].embedding = embeddings[i];
                  if (metadatas) docs[idx].metadata = metadatas[i];
                  if (documents) docs[idx].document = documents[i];
                }
              }
            },
            query: async ({ queryEmbeddings, nResults }) => {
              const sorted = docs
                .map((d, i) => ({ ...d, index: i, distance: Math.random() }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, nResults);
              return {
                ids: [sorted.map(s => s.id)],
                documents: [sorted.map(s => s.document)],
                metadatas: [sorted.map(s => s.metadata)],
                distances: [sorted.map(s => s.distance)],
              };
            },
            count: async () => docs.length,
            delete: async ({ ids }) => {
              if (ids) {
                for (const id of ids) {
                  const idx = docs.findIndex(d => d.id === id);
                  if (idx >= 0) docs.splice(idx, 1);
                }
              }
            },
          };
          collections.set(name, col);
        }
        return col;
      },
      createCollection: async ({ name, metadata }) => {
        if (!collections.has(name)) {
          store.set(name, []);
          collections.set(name, {
            add: async () => {},
            update: async () => {},
            query: async () => ({ ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] }),
            count: async () => 0,
            delete: async () => {},
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

    try {
      collection = await this.client!.getOrCreateCollection({
        name: collectionName,
        metadata: { project_id: projectId },
      });
    } catch {
      this.logger.warn(`Failed to get/create collection ${collectionName}, trying without existing check`);
      collection = await this.client!.createCollection({
        name: collectionName,
        metadata: { project_id: projectId },
      });
    }

    this.collections.set(cacheKey, collection);
    return collection;
  }

  async addDocuments(projectId: string, documents: RagDocument[], embeddings: number[][]): Promise<void> {
    if (documents.length === 0) return;

    const collection = await this.getCollection(projectId);

    await collection.add({
      ids: documents.map(d => d.id),
      embeddings,
      metadatas: documents.map(d => d.metadata),
      documents: documents.map(d => d.content),
    });

    this.logger.log(`Added ${documents.length} documents to project ${projectId}`);
  }

  async updateDocuments(projectId: string, ids: string[], documents: string[], embeddings?: number[][], metadatas?: Record<string, any>[]): Promise<void> {
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
    const collection = await this.getCollection(projectId);

    await collection.delete({ ids });

    this.logger.log(`Deleted ${ids.length} documents from project ${projectId}`);
  }

  async query(projectId: string, queryEmbedding: number[], nResults: number = 5): Promise<RagQueryResult> {
    const collection = await this.getCollection(projectId);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      include: ['documents', 'metadatas', 'distances'],
    });

    const documents: RagDocument[] = (results.documents[0] || []).map((content: string, i: number) => ({
      id: (results.ids[0] || [])[i] || '',
      content: content || '',
      metadata: (results.metadatas[0] || [])[i] || {},
    }));

    const distances = (results.distances[0] || []) as number[];

    return { documents, distances };
  }

  async deleteProjectCollection(projectId: string): Promise<void> {
    const collectionName = `project_${projectId.replace(/-/g, '_')}`;

    try {
      await this.client!.deleteCollection({ name: collectionName });
      this.collections.delete(`project_${projectId}`);
      this.logger.log(`Deleted collection ${collectionName}`);
    } catch (error: any) {
      this.logger.warn(`Failed to delete collection ${collectionName}: ${error.message}`);
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
