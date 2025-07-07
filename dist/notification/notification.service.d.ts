import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../student/entities/user.entity';
export declare class NotificationService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    createNotification(user: User, message: string): Promise<Notification>;
    getNotificationsForUser(userId: number): Promise<Notification[]>;
    markAsRead(notificationId: number): Promise<void>;
}
