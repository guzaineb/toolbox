import api from './api';
import { Notification } from '@/types/notification';

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await api.get(`/notifications${params}`);
    return response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
}

export const notificationService = NotificationService.getInstance();
