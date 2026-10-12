import { LlmService } from './llm.service';
import { LlmMessage, LlmRateLimitError } from './interfaces/ai.types';

describe('LlmService', () => {
  let service: LlmService;
  const originalKey = process.env.GROQ_API_KEY;

  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key';
    service = new LlmService();
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GROQ_API_KEY;
    } else {
      process.env.GROQ_API_KEY = originalKey;
    }
    jest.restoreAllMocks();
  });

  it('sérialise les messages au format wire OpenAI/Groq (snake_case)', async () => {
    const fetchMock = jest.fn();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          model: 'openai/gpt-oss-120b',
          choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        }),
    });
    (global as unknown as { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const messages: LlmMessage[] = [
      { role: 'system', content: 'system prompt' },
      { role: 'user', content: 'question' },
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-1',
            type: 'function',
            function: { name: 'getGBM', arguments: '{"projectId":"p"}' },
          },
        ],
      },
      {
        role: 'tool',
        content: '{"ok":true}',
        toolCallId: 'call-1',
        name: 'getGBM',
      },
    ];

    await service.chat(messages, { tools: [] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(request[1].body as string) as {
      messages: Record<string, unknown>[];
    };

    expect(body.messages[2]).toEqual({
      role: 'assistant',
      content: null,
      tool_calls: [
        {
          id: 'call-1',
          type: 'function',
          function: { name: 'getGBM', arguments: '{"projectId":"p"}' },
        },
      ],
    });
    expect(body.messages[3]).toEqual({
      role: 'tool',
      content: '{"ok":true}',
      tool_call_id: 'call-1',
      name: 'getGBM',
    });
    // Aucune clé interne camelCase ne doit fuiter vers l'API.
    expect(body.messages[2]).not.toHaveProperty('toolCalls');
    expect(body.messages[3]).not.toHaveProperty('toolCallId');
  });

  it('retourne une réponse de secours si GROQ_API_KEY est absente', async () => {
    delete process.env.GROQ_API_KEY;
    const fetchMock = jest.fn();
    (global as unknown as { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const result = await service.chat([{ role: 'user', content: 'salut' }]);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.model).toBe('fallback');
    expect(result.content).toContain('Mode dégradé');
  });

  it('respecte le retry-after de Groq (429) et remonte une LlmRateLimitError', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'retry-after': '0' }),
      text: () => Promise.resolve('{"error":{"code":"rate_limit_exceeded"}}'),
    });
    (global as unknown as { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    await expect(
      service.chat([{ role: 'user', content: 'salut' }]),
    ).rejects.toBeInstanceOf(LlmRateLimitError);
    // 4 tentatives malgré le 429 (le délai retry-after: 0 évite d'attendre).
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('déduit le délai de réessai depuis le corps et les en-têtes Groq', () => {
    const parse = (headers: Headers, body: string): number | undefined =>
      (
        service as unknown as {
          parseRetryDelayMs: (h: Headers, b: string) => number | undefined;
        }
      ).parseRetryDelayMs(headers, body);

    // Corps type Groq : « Please try again in 24.03s ».
    expect(parse(new Headers(), 'Please try again in 24.03s')).toBe(24030);

    // En-tête x-ratelimit-reset-tokens (secondes).
    expect(
      parse(new Headers({ 'x-ratelimit-reset-tokens': '7.66s' }), ''),
    ).toBe(7660);

    // Durées composées « 1m2.5s » et « 60ms ».
    expect(parse(new Headers(), 'try again in 1m2.5s')).toBe(62500);
    expect(parse(new Headers(), 'try again in 60ms')).toBe(60);

    // Aucune durée reconnaissable → undefined (repli exponentiel).
    expect(parse(new Headers(), 'rate limit reached')).toBeUndefined();
  });
});
