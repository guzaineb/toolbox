import { NotificationPriority } from '@prisma/client';

export interface NotificationRecipient {
  userId: string;
  email?: string;
}

export interface NotificationPayload {
  event: string;
  recipients: NotificationRecipient[];
  title: string;
  message: string;
  link?: string;
  senderId?: string;
  priority?: NotificationPriority;
  resourceType?: string;
  resourceId?: string;
}
