import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatbotService } from '../chatbot.service';
import { ChatbotAskDto, ChatbotIndexDto } from '../dto/chatbot.dto';

@Controller('ai/chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Post('ask')
  async ask(@Body() dto: ChatbotAskDto) {
    try {
      const result = await this.chatbot.ask(
        dto.projectId,
        dto.question,
        dto.conversationHistory,
      );
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index')
  async indexProject(@Body() dto: ChatbotIndexDto) {
    try {
      const result = await this.chatbot.indexProject(dto.projectId);
      return { success: true, data: result };
    } catch (error) {
      const status = error.message.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message: error.message }, status);
    }
  }
}
