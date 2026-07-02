import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RagDocument, RagQueryResult } from './interfaces/ai.types';

interface EmbeddingFunction {
  generate(texts: string[]): Promise<number[][]>;
}

interface ChromaCollection {
  add: (args: { ids: string[]; embeddings: number[][]; metadatas: Record<string, any>[]; documents: string[] }) => Promise<any>;
  query: (args: { queryEmbeddings: number[][]; nResults: number; include: string[] }) => Promise<any>;
  count: () => Promise<number>;
}

interface ChromaClientInstance {
  getOrCreateCollection: (args: { name: string; metadata?: Record<string, any> }) => Promise<ChromaCollection>;
  createCollection: (args: { name: string; metadata?: Record<string, any> }) => Promise<ChromaCollection>;
  deleteCollection: (args: { name: string }) => Promise<void>;
}

@Injectable()
export class RagService implements OnModuleDestroy {
  private readonly logger = new Logger(RagService.name);
  private client: ChromaClientInstance | null = null;
  private collections = new Map<string, ChromaCollection>();
  private embeddingFn: EmbeddingFunction | null = null;
  private isInitialized = false;

  async onModuleDestroy() {
    this.collections.clear();
    this.client = null;
    this.embeddingFn = null;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    const chromaUrl = process.env.CHROMA_DB_URL || 'http://localhost:8000';
    try {
      // @ts-ignore
      const { ChromaClient } = await import('chromadb');
      this.client = new ChromaClient({ path: chromaUrl }) as unknown as ChromaClientInstance;
    } catch {
      this.logger.warn(`ChromaDB client not available (install chromadb package). Using mock client.`);
      this.client = this.createMockClient();
    }

    this.embeddingFn = await this.createEmbeddingFunction();
    this.isInitialized = true;
    this.logger.log(`RAG service initialized with ChromaDB at ${chromaUrl}`);
  }

  private createMockClient(): ChromaClientInstance {
    const collections = new Map<string, ChromaCollection>();

    return {
      getOrCreateCollection: async ({ name, metadata }) => {
        let col = collections.get(name);
        if (!col) {
          const docs: any[] = [];
          col = {
            add: async ({ ids, embeddings, metadatas, documents }) => {
              for (let i = 0; i < ids.length; i++) {
                docs.push({ id: ids[i], embedding: embeddings[i], metadata: metadatas[i], document: documents[i] });
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
          };
          collections.set(name, col);
        }
        return col;
      },
      createCollection: async ({ name, metadata }) => {
        if (!collections.has(name)) {
          collections.set(name, {
            add: async () => {},
            query: async () => ({ ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] }),
            count: async () => 0,
          });
        }
        return collections.get(name)!;
      },
      deleteCollection: async ({ name }) => {
        collections.delete(name);
      },
    };
  }

  private async createEmbeddingFunction(): Promise<EmbeddingFunction> {
    if (process.env.OPENAI_API_KEY) {
      this.logger.log('Using OpenAI embeddings');
      return this.createOpenAIEmbeddingFunction();
    }

    try {
      this.logger.log('Attempting to use @xenova/transformers for local embeddings');
      return await this.createLocalEmbeddingFunction();
    } catch {
      this.logger.warn('No embedding provider available, using fallback identity embeddings');
      return this.createFallbackEmbeddingFunction();
    }
  }

  private createOpenAIEmbeddingFunction(): EmbeddingFunction {
    const apiKey = process.env.OPENAI_API_KEY;
    return {
      generate: async (texts: string[]): Promise<number[][]> => {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: texts,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI embedding error: ${response.status}`);
        }

        const data = await response.json();
        return data.data
          .sort((a: any, b: any) => a.index - b.index)
          .map((d: any) => d.embedding);
      },
    };
  }

  private async createLocalEmbeddingFunction(): Promise<EmbeddingFunction> {
    // @ts-ignore
    const { pipeline } = await import('@xenova/transformers');
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    return {
      generate: async (texts: string[]): Promise<number[][]> => {
        const results = await Promise.all(
          texts.map(text => extractor(text, { pooling: 'mean', normalize: true }))
        );
        return results.map(r => Array.from(r.data) as number[]);
      },
    };
  }

  private createFallbackEmbeddingFunction(): EmbeddingFunction {
    return {
      generate: async (texts: string[]): Promise<number[][]> => {
        return texts.map(() => Array(384).fill(0));
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

  async indexDocument(projectId: string, content: string, metadata: Record<string, any> = {}): Promise<void> {
    const collection = await this.getCollection(projectId);
    const embeddingFn = this.embeddingFn!;

    const id = `${projectId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const embeddings = await embeddingFn.generate([content]);

    await collection.add({
      ids: [id],
      embeddings,
      metadatas: [metadata],
      documents: [content],
    });

    this.logger.log(`Indexed document ${id} for project ${projectId}`);
  }

  async indexDocuments(projectId: string, documents: RagDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const collection = await this.getCollection(projectId);
    const embeddingFn = this.embeddingFn!;
    const texts = documents.map(d => d.content);

    const embeddings = await embeddingFn.generate(texts);

    await collection.add({
      ids: documents.map(d => d.id),
      embeddings,
      metadatas: documents.map(d => d.metadata),
      documents: texts,
    });

    this.logger.log(`Indexed ${documents.length} documents for project ${projectId}`);
  }

  async query(projectId: string, queryText: string, nResults: number = 5): Promise<RagQueryResult> {
    const collection = await this.getCollection(projectId);
    const embeddingFn = this.embeddingFn!;

    const queryEmbedding = await embeddingFn.generate([queryText]);

    const results = await collection.query({
      queryEmbeddings: queryEmbedding,
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
      const count = await collection.count();
      return count;
    } catch {
      return 0;
    }
  }
}
