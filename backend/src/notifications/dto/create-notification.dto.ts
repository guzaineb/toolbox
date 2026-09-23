import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import {
  NotificationType,
  NotificationPriority,
  ResourceType,
} from '@prisma/client';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
