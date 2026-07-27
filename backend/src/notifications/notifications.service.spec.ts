import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    notification: {
      create: jest.Func;
      createMany: jest.Func;
      findMany: jest.Func;
      findUnique: jest.Func;
      count: jest.Func;
      update: jest.Func;
      updateMany: jest.Func;
    };
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
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

  describe('create', () => {
    it('should create a notification', async () => {
      const notification = {
        id: 'notif-1',
        user_id: 'user-1',
        type: NotificationType.APPLICATION_SUBMITTED,
        title: 'Test',
        message: 'Test message',
        is_read: false,
        link: null,
        created_at: new Date(),
        updated_at: new Date(),
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
        },
      });
    });
  });

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
          { user_id: 'user-1', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined },
          { user_id: 'user-2', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined },
          { user_id: 'user-3', type: NotificationType.APPLICATION_SUBMITTED, title: 'New application', message: 'A project applied', link: undefined },
        ],
      });
    });

    it('should return empty array for empty user list', async () => {
      const result = await service.createMany([], NotificationType.APPLICATION_SUBMITTED, 'Test', 'Test');
      expect(result).toEqual([]);
      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return all notifications for a user', async () => {
      const notifications = [
        { id: '1', user_id: 'user-1', is_read: false },
        { id: '2', user_id: 'user-1', is_read: true },
      ];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

      const result = await service.findAllByUser('user-1');

      expect(result).toEqual(notifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        orderBy: { created_at: 'desc' },
        take: 50,
      });
    });

    it('should return only unread notifications when unreadOnly is true', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllByUser('user-1', true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false },
        orderBy: { created_at: 'desc' },
        take: 50,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread count', async () => {
      (prisma.notification.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toEqual({ count: 5 });
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = { id: 'notif-1', user_id: 'user-1', is_read: true };
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'notif-1', user_id: 'user-1' });
      (prisma.notification.update as jest.Mock).mockResolvedValue(notification);

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.is_read).toBe(true);
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

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result).toEqual({ success: true });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1', is_read: false },
        data: { is_read: true },
      });
    });
  });
});
