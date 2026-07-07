export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  model: string;
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
