import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { CHUNKING_CONFIG } from './rag-config';

/** Un morceau (chunk) produit par le découpage d'un document source. */
export interface Chunk {
  /** Id stable et déterministe : <project>_<documentKey>_<chunkIndex>. */
  id: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  contentHash: string;
}

/**
 * Découpage configurable d'un document en chunks.
 *
 * Configurable via RAG_CHUNK_SIZE / RAG_CHUNK_OVERLAP (caractères). Chaque chunk
 * reçoit un index déterministe (chunkIndex) qui garantit l'ordre et un id stable,
 * exploitables pour l'indexation incrémentale (seul ce qui a changé est ré-embarqué).
 */
@Injectable()
export class ChunkerService {
  private readonly chunkSize = CHUNKING_CONFIG.chunkSize;
  private readonly overlap = CHUNKING_CONFIG.overlap;

  sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  /**
   * Découpe un texte en chunks de taille ~chunkSize avec un recouvrement de `overlap`.
   * Découpe préférentiellement sur les frontières de phrase/paragraphe quand possible,
   * tout en restant sous la limite maximale pour éviter des chunks trop longs.
   */
  chunk(projectId: string, documentKey: string, text: string): Chunk[] {
    const normalized = (text ?? '').replace(/\r\n/g, '\n');
    if (!normalized.trim()) return [];

    const size = this.chunkSize;
    const chunks: Chunk[] = [];

    if (normalized.length <= size) {
      chunks.push({
        id: this.buildId(projectId, documentKey, 0),
        content: normalized,
        chunkIndex: 0,
        totalChunks: 1,
        contentHash: this.sha256(normalized),
      });
      return chunks;
    }

    let start = 0;
    let index = 0;
    while (start < normalized.length) {
      let end = Math.min(start + size, normalized.length);

      // Cherche une frontière de phrase/paragraphe juste avant la fin, sauf au dernier chunk.
      if (end < normalized.length) {
        const window = normalized.slice(start, end);
        const boundary = this.findBoundary(window);
        if (boundary > 0) {
          end = start + boundary;
        }
      }

      const content = normalized.slice(start, end).trim();
      if (content) {
        chunks.push({
          id: this.buildId(projectId, documentKey, index),
          content,
          chunkIndex: index,
          totalChunks: -1, // corrigé après coup
          contentHash: this.sha256(content),
        });
        index++;
      }

      // Avance avec recouvrement, mais toujours d'au moins 1 caractère (évite boucle infinie).
      let next = end - this.overlap;
      if (next <= start) next = start + 1;
      start = Math.min(next, normalized.length);
    }

    const total = chunks.length;
    chunks.forEach((c) => (c.totalChunks = total));
    return chunks;
  }

  /**
   * Trouve la position de la dernière frontière propre (saut de ligne, point, etc.)
   * dans le contenu, renvoyant l'index de fin INCLUSIF du boundary.
   */
  private findBoundary(window: string): number {
    // Priorité : fin de paragraphe, puis fin de phrase.
    const markers = ['\n\n', '\n', '. ', '! ', '? ', '; ', ': ', ', '];
    const idxs = markers
      .map((m) => window.lastIndexOf(m))
      .filter((i) => i >= 0);
    if (idxs.length === 0) return window.lastIndexOf(' ') + 1;
    return Math.max(...idxs) + (window[Math.max(...idxs)] === '\n' ? 1 : 2);
  }

  private buildId(
    projectId: string,
    documentKey: string,
    chunkIndex: number,
  ): string {
    return `${projectId}_${documentKey}_${chunkIndex}`;
  }
}
