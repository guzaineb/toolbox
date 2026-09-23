import api from './api';
import {
  Notification,
  PaginatedResponse,
  UnreadCountResponse,
  NotificationQueryParams,
} from '@/types/notification';

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getAll(params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params?.unreadOnly) query.unreadOnly = true;
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.type) query.type = params.type;
    if (params?.search) query.search = params.search;
    if (params?.sort) query.sort = params.sort;
    if (params?.startDate) query.startDate = params.startDate;
    if (params?.endDate) query.endDate = params.endDate;
    if (params?.archived !== undefined) query.archived = params.archived;

    const response = await api.get('/notifications', { params: query });
    return response.data;
  }

  async getOne(id: string): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
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

  async archive(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/archive`);
    return response.data;
  }

  async restore(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/restore`);
    return response.data;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
}

export const notificationService = NotificationService.getInstance();
