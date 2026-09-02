import { Controller, Post, Body, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
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
    // Identité prise uniquement depuis req.user (jamais du corps de requête).
    // Refuse toute tentative d'interroger un projet auquel l'utilisateur n'a pas accès.
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);
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
  async indexProject(@Body() dto: ChatbotIndexDto, @Req() req: RequestUser) {
    // Empêche d'indexer/supprimer/écraser la collection Chroma d'un projet d'autrui.
    await this.access.assertCanAccessProject(dto.projectId, req.user.id);
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
