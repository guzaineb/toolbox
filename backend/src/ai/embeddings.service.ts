import { Injectable, Logger } from '@nestjs/common';
import { EMBEDDING_CONFIG, EMBEDDING_DIMENSION } from './rag/rag-config';

/**
 * Service d'embedding — UNE seule configuration (modèle + dimension) verrouillée.
 *
 * Pour éviter toute incohérence de dimension (ex: bge-m3=1024 vs all-MiniLM=384),
 * ce service produit des vecteurs via un unique fournisseur défini par
 * `EMBEDDING_CONFIG`. Par défaut `local` (@xenova/transformers, all-MiniLM-L6-v2, 384).
 * Chaque vecteur produit est validé : dimension != attendue = erreur explicite
 * (jamais d'écriture silencieuse d'un vecteur de mauvaise dimension).
 */
@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  /** Dimension verrouillée des vecteurs. */
  readonly dimension = EMBEDDING_DIMENSION;
  /** Fonction de distance verrouillée. */
  readonly distanceFunction = EMBEDDING_CONFIG.distanceFunction;

  private localExtractor: any = null;
  private localInitialized = false;
  private apiAvailable: boolean | null = null;

  async generate(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const provider = EMBEDDING_CONFIG.provider;
    let vectors: number[][];

    if (provider === 'api') {
      vectors = await this.generateViaApi(texts);
    } else {
      vectors = await this.generateLocal(texts);
    }

    this.assertDimension(vectors);
    return vectors;
  }

  /** Vérifie que chaque vecteur a la dimension attendue. */
  private assertDimension(vectors: number[][]): void {
    for (let i = 0; i < vectors.length; i++) {
      if (vectors[i].length !== EMBEDDING_DIMENSION) {
        throw new Error(
          `Dimension d'embedding incohérente: reçu ${vectors[i].length}, attendu ${EMBEDDING_DIMENSION}. ` +
            "Vérifiez EMBEDDING_MODEL/EMBEDDING_DIMENSION : tous les vecteurs d'une collection doivent partager la même dimension.",
        );
      }
    }
  }

  private async generateViaApi(texts: string[]): Promise<number[][]> {
    const apiUrl =
      process.env.EMBEDDINGS_API_URL || 'http://localhost:7860/v1/embeddings';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBEDDING_CONFIG.model, input: texts }),
    });

    if (!response.ok) {
      this.apiAvailable = false;
      throw new Error(
        `Embeddings API error ${response.status}: ${response.statusText} (modèle: ${EMBEDDING_CONFIG.model}).`,
      );
    }

    const data = await response.json();
    this.apiAvailable = true;
    this.logger.log(
      `Embeddings API (${EMBEDDING_CONFIG.model}) generated ${texts.length} embeddings`,
    );
    return data.data
      .sort((a: any, b: any) => a.index - b.index)
      .map((d: any) => d.embedding as number[]);
  }

  private async generateLocal(texts: string[]): Promise<number[][]> {
    if (!this.localInitialized) {
      await this.initLocalEmbeddings();
    }
    if (!this.localExtractor) {
      throw new Error(
        'Embeddings locaux non disponibles (initialisation du modèle a échoué).',
      );
    }

    const results = await this.localExtractor(texts, {
      pooling: 'mean',
      normalize: true,
    });

    // all-MiniLM-L6-v2 : shape [n, 384]
    const arr = Array.isArray(results) ? results : results.data;
    return Array.from(arr).map((row: any) =>
      Array.isArray(row) ? (row as number[]) : Array.from(row),
    );
  }

  private async initLocalEmbeddings(): Promise<void> {
    try {
      this.logger.log(
        `Initialisation embeddinator local (${EMBEDDING_CONFIG.model})…`,
      );
      const { pipeline } = await import('@xenova/transformers');
      this.localExtractor = await pipeline(
        'feature-extraction',
        EMBEDDING_CONFIG.model,
      );
      this.localInitialized = true;
      this.logger.log(
        `Local embeddings initialized with ${EMBEDDING_CONFIG.model} (dim ${EMBEDDING_DIMENSION})`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize local embeddings: ${message}`);
      this.localExtractor = null;
      this.localInitialized = true;
    }
  }

  /** Health check simple : la dimension/modèle configurés sont-ils exploitables ? */
  async health(): Promise<{ available: boolean; reason?: string }> {
    if (EMBEDDING_CONFIG.provider === 'api') {
      if (this.apiAvailable === false) {
        return {
          available: false,
          reason: `API embeddings indisponible (${EMBEDDING_CONFIG.model}).`,
        };
      }
      try {
        await this.generate(['health check']);
        return { available: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { available: false, reason: message };
      }
    }

    // Local : tente d'initialiser le modèle
    try {
      if (!this.localInitialized) await this.initLocalEmbeddings();
      if (!this.localExtractor) {
        return {
          available: false,
          reason: "Modèle d'embedding local non initialisé.",
        };
      }
      return { available: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { available: false, reason: message };
    }
  }
}
