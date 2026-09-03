import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';

@Module({
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule {}
