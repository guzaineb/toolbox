import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LlmService } from '../llm.service';
import { GenerateDto, ChatDto } from '../dto/deepseek.dto';

/**
 * Modèles Groq autorisés pour les endpoints génériques /ai/llm/*.
 * Strictement limités à la configuration de l'application (GROQ_MODEL) pour
 * éviter qu'un utilisateur ne sélectionne un modèle arbitraire (coût/dispo)
 * ou n'expose involontairement un autre service. Vérifier le catalogue via
 * GET /openai/v1/models si Groq décommissionne un modèle (erreur 404).
 */
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const ALLOWED_MODELS = () => {
  const configured = process.env.GROQ_MODEL;
  const set = new Set<string>();
  if (configured) set.add(configured.trim());
  set.add(DEFAULT_MODEL);
  return set;
};

@Controller('ai/llm')
@UseGuards(JwtAuthGuard)
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  private assertAllowedModel(model?: string) {
    if (!model) return;
    if (!ALLOWED_MODELS().has(model.trim())) {
      throw new BadRequestException(
        `Modèle non autorisé : "${model}". Utilisez le modèle configuré pour l'application (env GROQ_MODEL).`,
      );
    }
  }

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    this.assertAllowedModel(dto.model);
    try {
      const result = await this.llm.generate(dto.prompt, {
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { success: false, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    this.assertAllowedModel(dto.model);
    try {
      const result = await this.llm.chat(dto.messages, {
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { success: false, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
