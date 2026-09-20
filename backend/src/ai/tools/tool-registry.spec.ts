import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from './tool-registry';
import { z } from 'zod';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolRegistry],
    }).compile();

    registry = module.get<ToolRegistry>(ToolRegistry);
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  describe('register + hasTool', () => {
    it('registers a tool and reports it exists', () => {
      registry.register({
        name: 'testTool',
        description: 'A test tool',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ result: z.string() }),
        handler: async () => ({ result: 'ok' }),
      });

      expect(registry.hasTool('testTool')).toBe(true);
      expect(registry.hasTool('unknown')).toBe(false);
    });
  });

  describe('getToolsForPrompt', () => {
    it('returns empty array when no tools registered', () => {
      expect(registry.getToolsForPrompt()).toEqual([]);
    });

    it('returns only registered tools as LlmTool array', () => {
      registry.register({
        name: 'getProjectState',
        description: 'State tool',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ data: z.any() }),
        handler: async () => ({ data: null }),
      });

      const tools = registry.getToolsForPrompt();
      expect(tools).toHaveLength(1);
      expect(tools[0].function.name).toBe('getProjectState');
    });

    it('does not return unregistered tools', () => {
      registry.register({
        name: 'getProjectState',
        description: 'State',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ data: z.any() }),
        handler: async () => ({ data: null }),
      });

      const tools = registry.getToolsForPrompt();
      expect(tools.every((t) => t.function.name === 'getProjectState')).toBe(true);
    });
  });

  describe('execute', () => {
    it('returns error for unknown tool', async () => {
      const result = await registry.execute('nonexistent', '{}', 'user-1');
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('inconnu');
    });

    it('returns error for malformed JSON args', async () => {
      registry.register({
        name: 'testTool',
        description: 'Test',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ ok: z.boolean() }),
        handler: async () => ({ ok: true }),
      });

      const result = await registry.execute('testTool', 'not-json', 'user-1');
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('JSON mal formé');
    });

    it('returns error for invalid input (missing projectId)', async () => {
      registry.register({
        name: 'testTool',
        description: 'Test',
        inputSchema: z.object({ projectId: z.string().uuid() }),
        outputSchema: z.object({ ok: z.boolean() }),
        handler: async () => ({ ok: true }),
      });

      const result = await registry.execute('testTool', '{"projectId":"bad"}', 'user-1');
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('Paramètres invalides');
    });

    it('calls handler with parsed args and userId, returns JSON', async () => {
      const handler = jest.fn().mockResolvedValue({ result: 'success' });
      registry.register({
        name: 'testTool',
        description: 'Test',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ result: z.string() }),
        handler,
      });

      const result = await registry.execute(
        'testTool',
        '{"projectId":"proj-123"}',
        'user-456',
      );
      const parsed = JSON.parse(result);

      expect(handler).toHaveBeenCalledWith({ projectId: 'proj-123' }, 'user-456');
      expect(parsed).toEqual({ result: 'success' });
    });

    it('catches handler errors and returns error JSON', async () => {
      registry.register({
        name: 'failingTool',
        description: 'Test',
        inputSchema: z.object({ projectId: z.string() }),
        outputSchema: z.object({ ok: z.boolean() }),
        handler: async () => {
          throw new Error('Access denied to project');
        },
      });

      const result = await registry.execute(
        'failingTool',
        '{"projectId":"proj-123"}',
        'user-456',
      );
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain('Access denied');
    });
  });
});
