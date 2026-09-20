import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import type { NotificationPayload } from './notification-payload.interface';
import { NOTIFICATION_EVENT_MAP } from './notification-event-map';

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @OnEvent('notification.**')
  async handleNotification(payload: NotificationPayload) {
    console.log('[NotificationListener] Event received:', payload.event);
    try {
      const config = NOTIFICATION_EVENT_MAP[payload.event];
      if (!config) {
        console.log(
          '[NotificationListener] No config found for event:',
          payload.event,
        );
        return;
      }

      const userIds = payload.recipients.map((r) => r.userId);
      if (userIds.length === 0) {
        console.log('[NotificationListener] No recipients, skipping');
        return;
      }
      console.log(
        '[NotificationListener] Creating notifications for users:',
        userIds,
      );

      const notifications = await Promise.all(
        userIds.map((userId) =>
          this.notificationsService.create(
            userId,
            config.type,
            payload.title,
            payload.message,
            payload.link,
            payload.senderId,
            payload.priority ?? config.priority,
            payload.resourceType as any,
            payload.resourceId,
          ),
        ),
      );
      console.log(
        '[NotificationListener] Notifications created in DB:',
        notifications.length,
      );
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const notification = notifications[i];
        this.notificationsGateway.sendNotification(userId, notification);
        console.log(
          '[NotificationListener] WebSocket notification sent to:',
          userId,
        );
        const { count } =
          await this.notificationsService.getUnreadCount(userId);
        this.notificationsGateway.sendUnreadUpdate(userId, count);
        console.log(
          '[NotificationListener] Unread count updated for',
          userId,
          ':',
          count,
        );
      }
    } catch (error) {
      console.error(
        '[NotificationListener] Error handling notification:',
        error,
      );
    }
  }
}
