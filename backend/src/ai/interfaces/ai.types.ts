export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface LlmTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LlmToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: LlmTool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface LlmResponse {
  content: string;
  model: string;
  toolCalls?: LlmToolCall[];
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface RagDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

export interface RagQueryResult {
  documents: RagDocument[];
  distances: number[];
}

/** État explicite du RAG lors d'une requête. Ne sont jamais considérés comme un succès les cas d'indisponibilité. */
export type RagStatus =
  | 'RAG_AVAILABLE'
  | 'RAG_UNAVAILABLE'
  | 'NO_RELEVANT_CONTEXT';

/** Métadonnées enrichies d'un chunk RAG. */
export interface RagChunkMetadata {
  project_id: string;
  module: string;
  section: string;
  source: string;
  document_key: string;
  language: string;
  page?: number;
  chunk_index: number;
  total_chunks: number;
  content_hash: string;
  dimension: number;
  distance_fn: string;
}

/** Source utilisée dans la réponse (pour citer les sources). */
export interface RagSource {
  id: string;
  documentKey: string;
  module: string;
  section: string;
  source: string;
  page?: number;
  chunkIndex: number;
  score: number;
}

/** État complet d'indexation incrémentale renvoyé après indexation d'un projet. */
export interface RagIndexResult {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
  total: number;
}

export interface SummaryInput {
  projectId: string;
  contextData: Record<string, any>;
}

export interface ReformulationInput {
  text: string;
  stepConcept: string;
  audience?: 'debutant' | 'intermediaire' | 'avance';
}

export interface ChatbotRequest {
  projectId: string;
  question: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChromaDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
}
