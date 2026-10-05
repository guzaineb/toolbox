import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailService } from '../mail/mail.service';
import { NotificationListener } from './notification-listener';
import { EmailNotificationListener } from './email-notification-listener';
import { NotificationMessageBuilder } from './notification-message-builder';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
    }),
    NotificationsModule,
  ],
  providers: [
    NotificationListener,
    EmailNotificationListener,
    MailService,
    NotificationMessageBuilder,
  ],
  exports: [NotificationMessageBuilder],
})
export class EventsModule {}
