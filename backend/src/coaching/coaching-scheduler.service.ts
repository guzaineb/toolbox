import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleAccessService } from '../common/services/module-access.service';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { NotificationEvent } from '../events/notification-event.enum';
import { CoachingActionStatus, ResourceType } from '@prisma/client';

@Injectable()
export class CoachingSchedulerService {
  private readonly logger = new Logger(CoachingSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ModuleAccessService,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  // Toutes les heures
  @Cron('0 * * * * *')
  async handleDeadlines() {
    try {
      await this.markOverdue();
      await this.remindDeadlineSoon();
    } catch (error) {
      this.logger.error('handleDeadlines failed', error);
    }
  }

  private async markOverdue() {
    const now = new Date();
    const overdueActions = await this.prisma.coachingAction.findMany({
      where: {
        status: { in: [CoachingActionStatus.PENDING, CoachingActionStatus.IN_PROGRESS, CoachingActionStatus.SUBMITTED] },
        deadline: { lt: now },
      },
      include: {
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    for (const action of overdueActions) {
      await this.prisma.coachingAction.update({
        where: { id: action.id },
        data: {
          status: CoachingActionStatus.OVERDUE,
          overdue_reminded_at: new Date(),
        },
      });

      const { title, message } = this.messageBuilder.coachingActionOverdue({
        actionTitle: action.title,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_ACTION_OVERDUE,
        recipients: [{ userId: action.project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${action.project.id}/coaching`,
        resourceType: ResourceType.COACHING,
        resourceId: action.project.id,
      });
    }

    if (overdueActions.length > 0) {
      this.logger.log(`${overdueActions.length} action(s) en retard marquée(s) OVERDUE`);
    }
  }

  private async remindDeadlineSoon() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const soonActions = await this.prisma.coachingAction.findMany({
      where: {
        status: { in: [CoachingActionStatus.PENDING, CoachingActionStatus.IN_PROGRESS, CoachingActionStatus.SUBMITTED] },
        deadline: { gte: now, lte: in24h },
        deadline_reminded_at: null,
      },
      include: {
        project: { select: { id: true, name: true, owner_id: true } },
      },
    });

    for (const action of soonActions) {
      await this.prisma.coachingAction.update({
        where: { id: action.id },
        data: { deadline_reminded_at: now },
      });

      const { title, message } = this.messageBuilder.coachingActionDeadlineSoon({
        actionTitle: action.title,
        deadline: action.deadline!,
      });
      this.access.notify({
        event: NotificationEvent.COACHING_ACTION_DEADLINE_SOON,
        recipients: [{ userId: action.project.owner_id }],
        title,
        message,
        link: `/project-owner/projects/${action.project.id}/coaching`,
        resourceType: ResourceType.COACHING,
        resourceId: action.project.id,
      });
    }

    if (soonActions.length > 0) {
      this.logger.log(`${soonActions.length} rappel(s) d'échéance proche envoyé(s)`);
    }
  }
}
