import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationType,
  NotificationPriority,
  ResourceType,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      create: jest.Mock;
      createMany: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    notificationPreference: {
      findUnique: jest.Mock;
      create: jest.Mock;
      upsert: jest.Mock;
    };
  };

  const now = new Date();

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      notificationPreference: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==================== CREATE ====================

  describe('create', () => {
    it('should create a notification with basic params (backward compatible)', async () => {
      const notification = {
        id: 'notif-1',
        user_id: 'user-1',
        type: NotificationType.APPLICATION_SUBMITTED,
        title: 'Test',
        message: 'Test message',
        is_read: false,
        is_archived: false,
        priority: NotificationPriority.MEDIUM,
        sender_id: null,
        resource_type: null,
        resource_id: null,
        read_at: null,
        link: null,
        created_at: now,
        updated_at: now,
      };
      (prisma.notification.create as jest.Mock).mockResolvedValue(notification);

      const result = await service.create(
        'user-1',
        NotificationType.APPLICATION_SUBMITTED,
        'Test',
        'Test message',
      );

      expect(result).toEqual(notification);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-1',
          type: NotificationType.APPLICATION_SUBMITTED,
          title: 'Test',
          message: 'Test message',
          link: undefined,
          sender_id: null,
          priority: NotificationPriority.MEDIUM,
          resource_type: null,
          resource_id: null,
        },
      });
    });

    it('should create a notification with link', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      await service.create(
        'user-1',
        NotificationType.INVITATION_RECEIVED,
        'Invitation',
        'You are invited',
        '/cohorts/123',
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-1',
          type: NotificationType.INVITATION_RECEIVED,
          title: 'Invitation',
          message: 'You are invited',
          link: '/cohorts/123',
          sender_id: null,
          priority: NotificationPriority.MEDIUM,
          resource_type: null,
          resource_id: null,
        },
      });
    });

    it('should create a notification with all params', async () => {
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      await service.create(
        'user-1',
        NotificationType.NEW_EVALUATION,
        'Nouvelle évaluation',
        'Vous avez une nouvelle évaluation',
        '/evaluations/123',
        'sender-1',
        NotificationPriority.HIGH,
        ResourceType.EVALUATION,
        'eval-1',
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-1',
          type: NotificationType.NEW_EVALUATION,
          title: 'Nouvelle évaluation',
          message: 'Vous avez une nouvelle évaluation',
          link: '/evaluations/123',
          sender_id: 'sender-1',
          priority: NotificationPriority.HIGH,
          resource_type: ResourceType.EVALUATION,
          resource_id: 'eval-1',
        },
      });
    });
  });

  // ==================== CREATE MANY ====================

  describe('createMany', () => {
    it('should create many notifications', async () => {
      (prisma.notification.createMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await service.createMany(
        ['user-1', 'user-2', 'user-3'],
        NotificationType.APPLICATION_SUBMITTED,
        'New application',
        'A project applied',
      );

      expect((result as any).count).toBe(3);
      expect(prisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          { user_id: 'user-1', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined, sender_id: null, priority: NotificationPriority.MEDIUM, resource_type: null, resource_id: null },
          { user_id: 'user-2', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined, sender_id: null, priority: NotificationPriority.MEDIUM, resource_type: null, resource_id: null },
          { user_id: 'user-3', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined, sender_id: null, priority: NotificationPriority.MEDIUM, resource_type: null, resource_id: null },
        ],
      });
    });

    it('should return empty array for empty user list', async () => {
      const result = await service.createMany([], NotificationType.APPLICATION_SUBMITTED, 'Test', 'Test');
      expect(result).toEqual([]);
      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });
  });

  // ==================== FIND ALL BY USER ====================

  describe('findAllByUser', () => {
    it('should return paginated notifications with defaults', async () => {
      const notifications = [
        { id: '1', user_id: 'user-1', is_read: false, is_archived: false },
        { id: '2', user_id: 'user-1', is_read: true, is_archived: false },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);
      (prisma.notification.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAllByUser('user-1');

      expect(result.items).toEqual(notifications);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_archived: false },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should accept boolean unreadOnly (backward compatible)', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(0);

      await service.findAllByUser('user-1', true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false, is_archived: false },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should filter by type', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(0);

      await service.findAllByUser('user-1', {
        type: NotificationType.COACHING_SESSION_SCHEDULED,
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          is_archived: false,
          type: NotificationType.COACHING_SESSION_SCHEDULED,
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should search by title or message', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(0);

      await service.findAllByUser('user-1', { search: 'coaching' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          is_archived: false,
          OR: [
            { title: { contains: 'coaching', mode: 'insensitive' } },
            { message: { contains: 'coaching', mode: 'insensitive' } },
          ],
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 20,
      });
    });
  });

  // ==================== FIND BY ID ====================

  describe('findById', () => {
    it('should return a notification by id', async () => {
      const notification = { id: 'notif-1', user_id: 'user-1' };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(notification);

      const result = await service.findById('notif-1', 'user-1');
      expect(result).toEqual(notification);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findById('unknown', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if not owned by user', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-2' });
      await expect(service.findById('notif-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== UNREAD COUNT ====================

  describe('getUnreadCount', () => {
    it('should return the unread count (excluding archived)', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false, is_archived: false },
      });
    });
  });

  // ==================== MARK AS READ ====================

  describe('markAsRead', () => {
    it('should mark a notification as read with timestamp', async () => {
      const notification = { id: 'notif-1', user_id: 'user-1', is_read: true, read_at: now };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-1' });
      (prisma.notification.update as jest.Mock).mockResolvedValue(notification);

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.is_read).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { is_read: true, read_at: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.markAsRead('unknown', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user does not own the notification', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-2' });
      await expect(service.markAsRead('notif-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== MARK ALL AS READ ====================

  describe('markAllAsRead', () => {
    it('should mark all notifications as read with timestamp', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result).toEqual({ success: true });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false },
        data: { is_read: true, read_at: expect.any(Date) },
      });
    });
  });

  // ==================== ARCHIVE ====================

  describe('archive', () => {
    it('should archive a notification', async () => {
      const notification = { id: 'notif-1', user_id: 'user-1', is_archived: true };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-1' });
      (prisma.notification.update as jest.Mock).mockResolvedValue(notification);

      const result = await service.archive('notif-1', 'user-1');
      expect(result.is_archived).toBe(true);
    });

    it('should throw if not found', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.archive('unknown', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== RESTORE ====================

  describe('restore', () => {
    it('should restore an archived notification', async () => {
      const notification = { id: 'notif-1', user_id: 'user-1', is_archived: false };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-1' });
      (prisma.notification.update as jest.Mock).mockResolvedValue(notification);

      const result = await service.restore('notif-1', 'user-1');
      expect(result.is_archived).toBe(false);
    });
  });

  // ==================== DELETE ====================

  describe('delete', () => {
    it('should delete a notification', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-1' });
      (prisma.notification.delete as jest.Mock).mockResolvedValue({});

      const result = await service.delete('notif-1', 'user-1');
      expect(result).toEqual({ success: true });
      expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: 'notif-1' } });
    });

    it('should throw if not found', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('unknown', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== PREFERENCES ====================

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      const prefs = { id: 'pref-1', user_id: 'user-1', email_enabled: true };
      (prisma.notificationPreference.findUnique as jest.Mock).mockResolvedValue(prefs);

      const result = await service.getPreferences('user-1');
      expect(result).toEqual(prefs);
    });

    it('should create preferences if not exist', async () => {
      (prisma.notificationPreference.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.notificationPreference.create as jest.Mock).mockResolvedValue({ id: 'new-pref', user_id: 'user-1' });

      const result = await service.getPreferences('user-1');
      expect(prisma.notificationPreference.create).toHaveBeenCalledWith({ data: { user_id: 'user-1' } });
      expect(result).toEqual({ id: 'new-pref', user_id: 'user-1' });
    });
  });

  describe('updatePreferences', () => {
    it('should upsert preferences', async () => {
      const prefs = { id: 'pref-1', user_id: 'user-1', email_enabled: false };
      (prisma.notificationPreference.upsert as jest.Mock).mockResolvedValue(prefs);

      const result = await service.updatePreferences('user-1', { emailEnabled: false });
      expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        create: { user_id: 'user-1', email_enabled: false },
        update: { email_enabled: false },
      });
      expect(result).toEqual(prefs);
    });
  });
});
