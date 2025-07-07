import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { MCQ } from './entities/mcq.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
export declare class StudentService {
    private usersRepository;
    private tasksRepository;
    private submissionsRepository;
    private mcqRepository;
    constructor(usersRepository: Repository<User>, tasksRepository: Repository<Task>, submissionsRepository: Repository<Submission>, mcqRepository: Repository<MCQ>);
    getTasks(): Promise<Task[]>;
    getMCQsByTask(taskId: number): Promise<MCQ[]>;
    submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<Submission>;
    private generateResultImage;
}
