import { Injectable, Logger } from '@nestjs/common';
import { DeepseekMessage, DeepseekOptions, DeepseekResponse } from './interfaces/ai.types';

@Injectable()
export class DeepseekService {
  private readonly logger = new Logger(DeepseekService.name);
  private readonly apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private readonly defaultModel = 'deepseek-chat';

  async generate(prompt: string, options?: DeepseekOptions): Promise<DeepseekResponse> {
    const messages: DeepseekMessage[] = [
      { role: 'system', content: 'Tu es un assistant expert en entrepreneuriat vert et en développement durable.' },
      { role: 'user', content: prompt },
    ];
    return this.chat(messages, options);
  }

  async chat(messages: DeepseekMessage[], options?: DeepseekOptions): Promise<DeepseekResponse> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not set, using fallback response');
      return this.fallbackResponse(messages);
    }

    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2000;

    const startTime = Date.now();

    try {
      const response = await fetch(this.apiUrl, {
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
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`DeepSeek API error ${response.status}: ${response.statusText} — ${errorBody}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      this.logger.log(`DeepSeek call completed in ${duration}ms, model: ${data.model}, tokens: ${data.usage?.total_tokens}`);

      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.logger.error(`DeepSeek API call failed: ${error.message}`);
      throw error;
    }
  }

  private fallbackResponse(messages: DeepseekMessage[]): DeepseekResponse {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const prompt = lastUserMessage?.content || '';
    return {
      content: `[Simulation DeepSeek] Réponse générée localement. Prompt reçu (${prompt.length} caractères). Configurez DEEPSEEK_API_KEY dans .env pour activer l\'IA.`,
      model: 'simulation',
    };
  }
}
