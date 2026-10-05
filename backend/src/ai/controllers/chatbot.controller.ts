import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ChatbotService } from '../chatbot.service';
import { ChatbotAskDto, ChatbotIndexDto } from '../dto/chatbot.dto';

type RequestUser = { user: { id: string } };

@Controller('ai/chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(
    private readonly chatbot: ChatbotService,
    private readonly access: ModuleAccessService,
  ) {}

  @Post('ask')
  async ask(@Body() dto: ChatbotAskDto, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);
    try {
      const result = await this.chatbot.ask(
        dto.projectId,
        req.user.id,
        dto.question,
        dto.conversationHistory,
        dto.module || dto.section || dto.step || dto.context
          ? { module: dto.module, section: dto.section, step: dto.step, context: dto.context }
          : undefined,
      );
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        { success: false, message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index')
  async indexProject(@Body() dto: ChatbotIndexDto, @Req() req: RequestUser) {
    // Empêche d'indexer/supprimer/écraser la collection Chroma d'un projet d'autrui.
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);
    try {
      const result = await this.chatbot.indexProject(dto.projectId);
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes('not found')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }
}
