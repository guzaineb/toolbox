/**
 * Configuration RAG verrouillée.
 *
 * UNE seule configuration d'embedding est utilisée (modèle + dimension + fonction de
 * distance) pour garantir qu'il n'existe jamais deux dimensions incompatibles dans
 * la même collection Chroma. Ces constantes sont lues au démarrage et restent stables
 * toute la durée de vie des vecteurs indexés.
 */

export interface EmbeddingConfig {
  /** Fournisseur d'embedding : 'local' (@xenova/transformers) ou 'api' (endpoint compatible). */
  provider: 'local' | 'api';
  /** Modèle d'embedding. */
  model: string;
  /** Dimension exacte des vecteurs produits par le modèle. */
  dimension: number;
  /** Fonction de distance utilisée par Chroma pour la recherche. 'cosine' uniquement. */
  distanceFunction: 'cosine';
  /** Seuil de pertinence (distance cosine) en dessous duquel un document est retenu. */
  relevanceThreshold: number;
}

function readNumber(env: string | undefined, fallback: number): number {
  if (!env) return fallback;
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

const configuredDimension = readEnv('EMBEDDING_DIMENSION');
let dimension = 384;
if (configuredDimension) {
  const parsed = Number(configuredDimension);
  dimension = Number.isFinite(parsed) && parsed > 0 ? parsed : 384;
}

/**
 * Dimension attendue des vecteurs.
 *
 * Le seul valeur par défaut cohérente avec `Xenova/all-MiniLM-L6-v2` est 384.
 * Si un autre modèle est configuré, ajuster EMBEDDING_DIMENSION explicitement.
 */
export const EMBEDDING_DIMENSION = dimension;

/** Fonction de distance verrouillée — cosine. */
export const EMBEDDING_DISTANCE_FUNCTION = 'cosine' as const;

export const EMBEDDING_CONFIG: EmbeddingConfig = {
  // Local par défaut : pas de dépendance externe, dimension stable (384).
  provider:
    (readEnv('EMBEDDING_PROVIDER') as EmbeddingConfig['provider']) || 'local',
  model: readEnv('EMBEDDING_MODEL') || 'Xenova/all-MiniLM-L6-v2',
  dimension: EMBEDDING_DIMENSION,
  distanceFunction: EMBEDDING_DISTANCE_FUNCTION,
  // Distance cosine automatiquement réglée à ~0.4 (similarité >= 0.6).
  relevanceThreshold: readNumber(process.env.RAG_DISTANCE_THRESHOLD, 0.4),
};

export interface ChunkingConfig {
  /** Taille cible d'un chunk en caractères. */
  chunkSize: number;
  /** Recouvrement entre chunks consécutifs. */
  overlap: number;
}

export const CHUNKING_CONFIG: ChunkingConfig = {
  chunkSize: readNumber(process.env.RAG_CHUNK_SIZE, 800),
  overlap: readNumber(process.env.RAG_CHUNK_OVERLAP, 150),
};
