import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity'; 
import { User } from '../student/entities/user.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}

    async createNotification(user: User, message: string): Promise<Notification> {
        const notification = this.notificationRepository.create({
            user,
            message,
            read: false,
        });
        return this.notificationRepository.save(notification)
    }

    async getNotificationsForUser(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(notificationId: number): Promise<void> {
        await this.notificationRepository.update(notificationId, { read: true });
    }
}