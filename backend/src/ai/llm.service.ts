import { Injectable, Logger } from '@nestjs/common';
import { LlmMessage, LlmOptions, LlmResponse } from './interfaces/ai.types';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  /**
   * Modèle par défaut surchargé par GROQ_MODEL (.env).
   * NB : Groq décommissionne régulièrement ses modèles — en cas d'erreur
   * "model_not_found" (404), vérifier le catalogue via GET /openai/v1/models.
   */
  private readonly defaultModel =
    process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  async generate(prompt: string, options?: LlmOptions): Promise<LlmResponse> {
    const messages: LlmMessage[] = [
      {
        role: 'system',
        content:
          'Tu es un assistant expert en entrepreneuriat vert et en développement durable.',
      },
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async chat(
    messages: LlmMessage[],
    options?: LlmOptions,
  ): Promise<LlmResponse> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not set, using fallback response');
      return this.fallbackResponse(messages);
    }

    const model = options?.model || process.env.GROQ_MODEL || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const startTime = Date.now();

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens: maxTokens,
            }),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          throw new Error(
            `Groq API error ${response.status}: ${response.statusText} — ${errorBody}`,
          );
        }

        const data = await response.json();
        const duration = Date.now() - startTime;

        this.logger.log(
          `Groq call completed in ${duration}ms, model: ${data.model}, tokens: ${data.usage?.total_tokens}`,
        );

        return {
          content: data.choices[0]?.message?.content || '',
          model: data.model,
          usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
              }
            : undefined,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Groq API call attempt ${attempt}/3 failed: ${error.message}`,
        );

        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `Groq API call failed after 3 attempts: ${lastError!.message}`,
    );
    throw lastError;
  }

  private fallbackResponse(messages: LlmMessage[]): LlmResponse {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    const prompt = lastUserMessage?.content || '';
    return {
      content: `[Mode dégradé] Réponse générée localement. Prompt reçu (${prompt.length} caractères). Configurez GROQ_API_KEY dans .env pour activer l'IA.`,
      model: 'fallback',
    };
  }
}
