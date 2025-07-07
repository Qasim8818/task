import { User } from './user.entity';
import { Task } from './task.entity';
export declare class Submission {
    id: number;
    student: User;
    task: Task;
    imageUrl: string;
    score: number;
    attemptTime: number;
    startTime: Date;
    createdAt: Date;
}
