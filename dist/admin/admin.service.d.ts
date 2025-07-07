import { Repository } from "typeorm";
import { User } from "../student/entities/user.entity";
import { Task } from "../student/entities/task.entity";
import { MCQ } from "../student/entities/mcq.entity";
import { NotificationService } from '../notification/notification.service';
export declare class AdminService {
    private usersRepository;
    private tasksRepository;
    private mcqRepository;
    private notificationService;
    constructor(usersRepository: Repository<User>, tasksRepository: Repository<Task>, mcqRepository: Repository<MCQ>, notificationService: NotificationService);
    registerStudent(username: string, password: string): Promise<any>;
    uploadTask(title: string, description: string, adminId: number): Promise<Task>;
    uploadMCQs(taskId: number, mcqs: {
        question: string;
        options: string[];
        correctOptionIndex: number;
    }[]): Promise<MCQ[]>;
    getStudents(): Promise<any[]>;
}
