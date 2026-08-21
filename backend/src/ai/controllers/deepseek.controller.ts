import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LlmService } from '../llm.service';
import { GenerateDto, ChatDto } from '../dto/deepseek.dto';

@Controller('ai/llm')
@UseGuards(JwtAuthGuard)
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    try {
      const result = await this.llm.generate(dto.prompt, {
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    try {
      const result = await this.llm.chat(dto.messages, {
        model: dto.model,
        temperature: dto.temperature,
        maxTokens: dto.maxTokens,
      });
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
