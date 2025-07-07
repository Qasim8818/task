import { User } from '../student/entities/user.entity';
export declare class Notification {
    id: number;
    user: User;
    message: string;
    read: boolean;
    createdAt: Date;
}
