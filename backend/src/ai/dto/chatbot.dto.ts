import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConversationMessageDto {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatbotAskDto {
  @IsUUID()
  projectId: string;

  @IsString()
  question: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationHistory?: ConversationMessageDto[];

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  step?: string;

  @IsOptional()
  @IsString()
  context?: string;
}

export class ChatbotIndexDto {
  @IsUUID()
  projectId: string;
}
