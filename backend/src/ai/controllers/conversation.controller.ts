import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { ConversationService } from '../conversation/conversation.service';
import { MessageService } from '../conversation/message.service';

type RequestUser = { user: { id: string } };

@Controller('ai/conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversations: ConversationService,
    private readonly messages: MessageService,
    private readonly access: ModuleAccessService,
  ) {}

  @Get()
  async listByProject(
    @Query('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: RequestUser,
  ) {
    if (!projectId) {
      throw new HttpException(
        { success: false, message: 'projectId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.access.assertCanAccessProject(projectId, req!.user.id);

    try {
      const result = await this.conversations.listByProject(
        projectId,
        req!.user.id,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
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

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: RequestUser,
  ) {
    if (!projectId) {
      throw new HttpException(
        { success: false, message: 'projectId is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.access.assertCanAccessProject(projectId, req!.user.id);

    try {
      const result = await this.messages.getMessages(
        conversationId,
        projectId,
        req!.user.id,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 50,
      );
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException({ success: false, message }, status);
    }
  }
}
