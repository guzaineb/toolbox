import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async create(userId: string, type: string, title: string, message?: string, projectId?: string): Promise<Notification> {
    const notif = this.notifRepo.create({
      user_id: userId,
      type,
      title,
      message: message || null,
      project_id: projectId || null,
    } as any);
    return this.notifRepo.save(notif) as any;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.notifRepo.findOneBy({ id, user_id: userId });
    if (notif) {
      notif.is_read = true;
      return this.notifRepo.save(notif);
    }
    return notif as any;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.update({ user_id: userId, is_read: false }, { is_read: true });
  }

  async countUnread(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { user_id: userId, is_read: false } });
  }
}
