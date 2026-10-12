import { LlmService } from './llm.service';
import { LlmMessage } from './interfaces/ai.types';

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
});
