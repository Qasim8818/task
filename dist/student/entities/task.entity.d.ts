import { User } from './user.entity';
import { MCQ } from './mcq.entity';
export declare class Task {
    id: number;
    title: string;
    description: string;
    admin: User;
    mcqs: MCQ[];
}
