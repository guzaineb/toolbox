import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private localExtractor: any = null;
  private localInitialized = false;

  async generate(texts: string[]): Promise<number[][]> {
    try {
      return await this.tryLightweightEmbeddings(texts);
    } catch (error) {
      this.logger.warn(`LightweightEmbeddings API failed: ${error.message}. Falling back to local embeddings.`);
      return this.tryLocalEmbeddings(texts);
    }
  }

  private async tryLightweightEmbeddings(texts: string[]): Promise<number[][]> {
    const apiUrl = process.env.EMBEDDINGS_API_URL || 'http://localhost:7860/v1/embeddings';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'bge-m3',
        input: texts,
      }),
    });

    if (!response.ok) {
      throw new Error(`LightweightEmbeddings API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    this.logger.log(`LightweightEmbeddings generated ${texts.length} embeddings`);

    return data.data
      .sort((a: any, b: any) => a.index - b.index)
      .map((d: any) => d.embedding);
  }

  private async tryLocalEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.localInitialized) {
      await this.initLocalEmbeddings();
    }

    const results = await Promise.all(
      texts.map(text => this.localExtractor(text, { pooling: 'mean', normalize: true }))
    );
    return results.map(r => Array.from(r.data) as number[]);
  }

  private async initLocalEmbeddings(): Promise<void> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.localExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.localInitialized = true;
      this.logger.log('Local embeddings initialized with all-MiniLM-L6-v2');
    } catch (error) {
      this.logger.error(`Failed to initialize local embeddings: ${error.message}`);
      this.localExtractor = null;
      this.localInitialized = true;
    }
  }
}
