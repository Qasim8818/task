import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { MCQ } from './entities/mcq.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { NotificationService } from '../notification/notification.service';
export declare class StudentService {
    private usersRepository;
    private tasksRepository;
    private submissionsRepository;
    private mcqRepository;
    private notificationService;
    constructor(usersRepository: Repository<User>, tasksRepository: Repository<Task>, submissionsRepository: Repository<Submission>, mcqRepository: Repository<MCQ>, notificationService: NotificationService);
    getTasks(): Promise<Task[]>;
    getMCQsByTask(taskId: number): Promise<MCQ[]>;
    startTask(studentId: number, taskId: number): Promise<Submission>;
    submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<Submission>;
    private generateResultImage;
    getDailyLeaderboard(): Promise<any[]>;
    getStudentById(studentId: number): Promise<User>;
    getWeeklyLeaderboard(): Promise<any[]>;
    getMonthlyLeaderboard(): Promise<any[]>;
}
