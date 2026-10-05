import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LlmController } from './deepseek.controller';
import { LlmService } from '../llm.service';

describe('LlmController /ai/llm (garde modèle — coût)', () => {
  let controller: LlmController;
  const llmMock = {
    generate: jest.fn(),
    chat: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.GROQ_MODEL = 'openai/gpt-oss-120b';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmController],
      providers: [{ provide: LlmService, useValue: llmMock }],
    }).compile();
    controller = module.get<LlmController>(LlmController);
  });

  afterAll(() => {
    delete process.env.GROQ_MODEL;
  });

  it('should be défini', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /ai/llm/generate', () => {
    it('modèle non autorisé (arbitraire/externe) : rejeté 400, appel LLM non déclenché', async () => {
      await expect(
        controller.generate({
          prompt: 'p',
          model: 'some-external-expensive-model',
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(llmMock.generate).not.toHaveBeenCalled();
    });

    it('modèle configuré (GROQ_MODEL) autorisé', async () => {
      llmMock.generate.mockResolvedValue({
        content: 'ok',
        model: 'openai/gpt-oss-120b',
      });
      await controller.generate({ prompt: 'p', model: process.env.GROQ_MODEL });
      expect(llmMock.generate).toHaveBeenCalled();
    });

    it('sans modèle : défaut accepté', async () => {
      llmMock.generate.mockResolvedValue({ content: 'ok' });
      await controller.generate({ prompt: 'p' });
      expect(llmMock.generate).toHaveBeenCalled();
    });
  });

  describe('POST /ai/llm/chat', () => {
    it('modèle non autorisé : rejeté 400, appel LLM non déclenché', async () => {
      await expect(
        controller.chat({
          messages: [{ role: 'user', content: 'q' }],
          model: 'other-model',
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(llmMock.chat).not.toHaveBeenCalled();
    });

    it('modèle configuré autorisé', async () => {
      llmMock.chat.mockResolvedValue({ content: 'ok' });
      await controller.chat({
        messages: [{ role: 'user', content: 'q' }],
        model: process.env.GROQ_MODEL,
      });
      expect(llmMock.chat).toHaveBeenCalled();
    });
  });
});
