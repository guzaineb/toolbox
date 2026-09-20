import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationType,
  NotificationPriority,
  ResourceType,
  Prisma,
} from '@prisma/client';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

type FindAllParams = {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  type?: NotificationType;
  search?: string;
  sort?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  archived?: boolean;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CREATE ====================

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
  ): Promise<any>;
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    senderId?: string,
    priority?: NotificationPriority,
    resourceType?: ResourceType,
    resourceId?: string,
  ): Promise<any>;
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    senderId?: string,
    priority?: NotificationPriority,
    resourceType?: ResourceType,
    resourceId?: string,
  ): Promise<any> {
    return this.prisma.notification.create({
      data: {
        user_id: userId,
        type,
        title,
        message,
        link,
        sender_id: senderId ?? null,
        priority: priority ?? NotificationPriority.MEDIUM,
        resource_type: resourceType ?? null,
        resource_id: resourceId ?? null,
      },
    });
  }

  // ==================== CREATE MANY ====================

  async createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    senderId?: string,
    priority?: NotificationPriority,
    resourceType?: ResourceType,
    resourceId?: string,
  ) {
    if (userIds.length === 0) return [];

    const data = userIds.map((user_id) => ({
      user_id,
      type,
      title,
      message,
      link,
      sender_id: senderId ?? null,
      priority: priority ?? NotificationPriority.MEDIUM,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
    }));

    return this.prisma.notification.createMany({ data });
  }

  // ==================== FIND ALL (paginated, filtered) ====================

  async findAllByUser(userId: string, params?: boolean | FindAllParams) {
    const query: FindAllParams =
      typeof params === 'boolean' ? { unreadOnly: params } : (params ?? {});

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      user_id: userId,
      is_archived: query.archived ?? false,
    };

    if (query.unreadOnly) {
      where.is_read = false;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.created_at = {};
      if (query.startDate) {
        where.created_at.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.created_at.lte = new Date(query.endDate);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: query.sort ?? 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================== FIND BY ID ====================

  async findById(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }
    return notification;
  }

  // ==================== UNREAD COUNT ====================

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false, is_archived: false },
    });
    return { count };
  }

  // ==================== MARK AS READ ====================

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true, read_at: new Date() },
    });
  }

  // ==================== MARK ALL AS READ ====================

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true, read_at: new Date() },
    });
    return { success: true };
  }

  // ==================== ARCHIVE ====================

  async archive(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { is_archived: true },
    });
  }

  // ==================== RESTORE ====================

  async restore(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { is_archived: false },
    });
  }

  // ==================== DELETE ====================

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification introuvable');
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // ==================== PREFERENCES ====================

  async getPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({
      where: { user_id: userId },
    });

    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({
        data: { user_id: userId },
      });
    }

    return prefs;
  }

  async updatePreferences(
    userId: string,
    data: {
      inAppEnabled?: boolean;
      emailEnabled?: boolean;
      realtimeEnabled?: boolean;
      coachingEnabled?: boolean;
      evaluationEnabled?: boolean;
      cohortEnabled?: boolean;
      invitationEnabled?: boolean;
      documentEnabled?: boolean;
      aiEnabled?: boolean;
      adminEnabled?: boolean;
    },
  ) {
    const mapped: Record<string, unknown> = {};
    if (data.inAppEnabled !== undefined)
      mapped.in_app_enabled = data.inAppEnabled;
    if (data.emailEnabled !== undefined)
      mapped.email_enabled = data.emailEnabled;
    if (data.realtimeEnabled !== undefined)
      mapped.realtime_enabled = data.realtimeEnabled;
    if (data.coachingEnabled !== undefined)
      mapped.coaching_enabled = data.coachingEnabled;
    if (data.evaluationEnabled !== undefined)
      mapped.evaluation_enabled = data.evaluationEnabled;
    if (data.cohortEnabled !== undefined)
      mapped.cohort_enabled = data.cohortEnabled;
    if (data.invitationEnabled !== undefined)
      mapped.invitation_enabled = data.invitationEnabled;
    if (data.documentEnabled !== undefined)
      mapped.document_enabled = data.documentEnabled;
    if (data.aiEnabled !== undefined) mapped.ai_enabled = data.aiEnabled;
    if (data.adminEnabled !== undefined)
      mapped.admin_enabled = data.adminEnabled;

    const prefs = await this.prisma.notificationPreference.upsert({
      where: { user_id: userId },
      create: { user_id: userId, ...mapped } as any,
      update: mapped as any,
    });

    return prefs;
  }

  // ==================== SHOULD SEND (utility for email/realtime) ====================

  async shouldSendEmail(userId: string, category: string): Promise<boolean> {
    const prefs = await this.getPreferences(userId);
    if (!prefs.email_enabled) return false;

    const categoryMap: Record<string, keyof typeof prefs> = {
      coaching: 'coaching_enabled',
      evaluation: 'evaluation_enabled',
      cohort: 'cohort_enabled',
      invitation: 'invitation_enabled',
      document: 'document_enabled',
      ai: 'ai_enabled',
      admin: 'admin_enabled',
    };

    const key = categoryMap[category];
    if (key && prefs[key] === false) return false;

    return true;
  }
}
