export interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepseekOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DeepseekResponse {
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
