import { StudentService } from './student.service';
import { AuthService } from '../auth/auth.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
export declare class StudentController {
    private readonly studentService;
    private readonly authService;
    constructor(studentService: StudentService, authService: AuthService);
    getTasks(): Promise<import("./entities/task.entity").Task[]>;
    getMCQs(taskId: number): Promise<import("./entities/mcq.entity").MCQ[]>;
    startTask(body: {
        studentId: number;
        taskId: number;
    }): Promise<import("./entities/submission.entity").Submission>;
    submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<import("./entities/submission.entity").Submission>;
    login(body: {
        username: string;
        password: string;
    }): Promise<any>;
    getDailyLeaderboard(): Promise<any[]>;
    getWeeklyLeaderboard(): Promise<any[]>;
    getMonthlyLeaderboard(): Promise<any[]>;
}
