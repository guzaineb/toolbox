import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationPayload } from './notification-payload.interface';
import { NOTIFICATION_EVENT_MAP } from './notification-event-map';

@Injectable()
export class EmailNotificationListener {
  constructor(
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('notification.**')
  async handleEmail(payload: NotificationPayload) {
    console.log('[EmailNotificationListener] Event received:', payload.event);
    const config = NOTIFICATION_EVENT_MAP[payload.event];
    if (!config) {
      console.log(
        '[EmailNotificationListener] No config for event:',
        payload.event,
      );
      return;
    }
    if (!config.requiresEmail) {
      console.log(
        '[EmailNotificationListener] Email not required for event:',
        payload.event,
      );
      return;
    }

    console.log(
      '[EmailNotificationListener] Processing email for event:',
      payload.event,
    );
    for (const recipient of payload.recipients) {
      const shouldSend = await this.notificationsService.shouldSendEmail(
        recipient.userId,
        config.category,
      );
      console.log(
        '[EmailNotificationListener] shouldSendEmail for',
        recipient.userId,
        ':',
        shouldSend,
      );
      if (!shouldSend) continue;

      let email = recipient.email;
      let userName: string | undefined;

      if (!email) {
        const user = await this.prisma.user.findUnique({
          where: { id: recipient.userId },
          include: { profile: true },
        });
        if (!user?.email) {
          console.log(
            '[EmailNotificationListener] User has no email, skipping:',
            recipient.userId,
          );
          continue;
        }
        email = user.email;
        userName = user.profile?.first_name
          ? `${user.profile.first_name} ${user.profile.last_name ?? ''}`.trim()
          : user.email;
      }

      console.log(
        '[EmailNotificationListener] Sending email to:',
        email,
        'type:',
        config.type,
      );
      await this.mailService.sendNotificationEmail({
        to: email,
        type: config.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        userName,
      });
      console.log('[EmailNotificationListener] Email sent to:', email);
    }
  }
}
