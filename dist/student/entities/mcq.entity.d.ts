import { Task } from './task.entity';
export declare class MCQ {
    id: number;
    question: string;
    options: string[];
    correctOptionIndex: number;
    task: Task;
}
