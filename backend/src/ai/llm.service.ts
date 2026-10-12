import { Injectable, Logger } from '@nestjs/common';
import {
  LlmMessage,
  LlmOptions,
  LlmRateLimitError,
  LlmResponse,
} from './interfaces/ai.types';

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

  /** Nombre total de tentatives d'appel à l'API Groq. */
  private static readonly MAX_ATTEMPTS = 4;

  /** Plafond du délai d'attente entre deux tentatives (ms). */
  private static readonly MAX_RETRY_DELAY_MS = 60_000;

  getModelName(): string {
    return process.env.GROQ_MODEL || this.defaultModel;
  }

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

    for (let attempt = 1; attempt <= LlmService.MAX_ATTEMPTS; attempt++) {
      try {
        const startTime = Date.now();

        const body: Record<string, unknown> = {
          model,
          messages: this.toWireMessages(messages),
          temperature,
          max_tokens: maxTokens,
        };

        if (options?.tools && options.tools.length > 0) {
          body.tools = options.tools;
          if (options.toolChoice) {
            body.tool_choice = options.toolChoice;
          }
        }

        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          const message = `Groq API error ${response.status}: ${response.statusText} — ${errorBody}`;

          // 429 : quota / débit dépassé. On respecte le délai indiqué par Groq
          // (`retry-after` ou « Please try again in Xs ») pour ne pas réessayer
          // dans la fenêtre saturée, et on remonte une erreur typée au client.
          if (response.status === 429) {
            throw new LlmRateLimitError(
              message,
              this.parseRetryDelayMs(response.headers, errorBody),
            );
          }

          throw new Error(message);
        }

        const data = await response.json();
        const duration = Date.now() - startTime;

        this.logger.log(
          `Groq call completed in ${duration}ms, model: ${data.model}, tokens: ${data.usage?.total_tokens}`,
        );

        return {
          content: data.choices[0]?.message?.content || '',
          model: data.model,
          toolCalls: data.choices[0]?.message?.tool_calls ?? undefined,
          finishReason: data.choices[0]?.finish_reason ?? undefined,
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
          `Groq API call attempt ${attempt}/${LlmService.MAX_ATTEMPTS} failed: ${error.message}`,
        );

        if (attempt < LlmService.MAX_ATTEMPTS) {
          const requestedDelay =
            error instanceof LlmRateLimitError ? error.retryAfterMs : undefined;
          const fallbackDelay = Math.pow(2, attempt) * 1000;
          const delay = Math.min(
            requestedDelay ?? fallbackDelay,
            LlmService.MAX_RETRY_DELAY_MS,
          );

          if (requestedDelay !== undefined) {
            this.logger.warn(
              `Groq rate limit: attente de ${delay}ms avant la tentative ${attempt + 1}/${LlmService.MAX_ATTEMPTS}`,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error(
      `Groq API call failed after ${LlmService.MAX_ATTEMPTS} attempts: ${lastError!.message}`,
    );
    throw lastError;
  }

  /**
   * Détermine le délai d'attente (ms) avant de réessayer après un 429.
   * Sources, par ordre de priorité :
   *  1. l'en-tête `retry-after` (secondes ou date HTTP) ;
   *  2. l'en-tête `x-ratelimit-reset-tokens` (durée type « 7.66s », « 1m2.5s ») ;
   *  3. la durée « Please try again in Xs » présente dans le corps de l'erreur.
   */
  private parseRetryDelayMs(
    headers: Headers,
    errorBody: string,
  ): number | undefined {
    const retryAfter = headers.get('retry-after');
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds)) {
        return Math.max(0, seconds) * 1000;
      }

      const date = Date.parse(retryAfter);
      if (!Number.isNaN(date)) {
        return Math.max(0, date - Date.now());
      }
    }

    const fromResetHeader = this.parseDurationMs(
      headers.get('x-ratelimit-reset-tokens'),
    );
    if (fromResetHeader !== undefined) {
      return fromResetHeader;
    }

    const match = /try again in\s+((?:\d+(?:\.\d+)?\s*(?:ms|s|m|h))+)/i.exec(
      errorBody,
    );
    return match ? this.parseDurationMs(match[1]) : undefined;
  }

  /**
   * Convertit une durée textuelle (« 60ms », « 24.03s », « 1m2.5s ») en
   * millisecondes. Renvoie `undefined` si aucune durée n'est reconnue.
   */
  private parseDurationMs(value?: string | null): number | undefined {
    if (!value) {
      return undefined;
    }

    const pattern = /(\d+(?:\.\d+)?)\s*(ms|s|m|h)/gi;
    let total = 0;
    let matched = false;

    for (const match of value.matchAll(pattern)) {
      const amount = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      matched = true;

      if (unit === 'ms') total += amount;
      else if (unit === 's') total += amount * 1000;
      else if (unit === 'm') total += amount * 60_000;
      else total += amount * 3_600_000;
    }

    return matched && total > 0 ? total : undefined;
  }

  /**
   * Convertit les messages internes (camelCase) au format attendu par l'API
   * OpenAI/Groq (snake_case). Sans cette conversion, un message assistant
   * contenant des appels d'outils est rejeté en 400
   * (`property 'toolCalls' is unsupported`).
   */
  private toWireMessages(messages: LlmMessage[]): Record<string, unknown>[] {
    return messages.map((message) => {
      if (message.role === 'tool') {
        return {
          role: 'tool',
          content: message.content,
          tool_call_id: message.toolCallId,
          ...(message.name ? { name: message.name } : {}),
        };
      }

      if (
        message.role === 'assistant' &&
        message.toolCalls &&
        message.toolCalls.length > 0
      ) {
        return {
          role: 'assistant',
          content: message.content || null,
          tool_calls: message.toolCalls,
        };
      }

      return { role: message.role, content: message.content };
    });
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
