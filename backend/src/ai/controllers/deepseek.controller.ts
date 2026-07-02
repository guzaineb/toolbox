import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { DeepseekService } from '../deepseek.service';
import { GenerateDto, ChatDto } from '../dto/deepseek.dto';

@Controller('ai/deepseek')
export class DeepseekController {
  constructor(private readonly deepseek: DeepseekService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    try {
      const result = await this.deepseek.generate(dto.prompt, {
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
      const result = await this.deepseek.chat(dto.messages, {
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
