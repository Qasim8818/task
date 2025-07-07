import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { MCQ } from './entities/mcq.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,
    @InjectRepository(MCQ)
    private mcqRepository: Repository<MCQ>,
    private notificationService: NotificationService,
  ) {}

  async getTasks(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async getMCQsByTask(taskId: number): Promise<MCQ[]> {
    return this.mcqRepository.find({ where: { task: { id: taskId } } });
  }

  async submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<Submission> {
    const { studentId, taskId, answers, startTime, endTime } = submitAnswersDto;
    const attemptTime = endTime - startTime;

    const student = await this.usersRepository.findOne({ where: { id: studentId, role: UserRole.STUDENT } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: ['mcqs'] });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.mcqs.length !== answers.length) {
      throw new Error('Number of answers does not match number of questions');
    }

    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === task.mcqs[i].correctOptionIndex) {
        score++;
      }
    }

    const imageUrl = await this.generateResultImage(score);

    const submission = this.submissionsRepository.create({
      student,
      task,
      imageUrl,
      score,
      attemptTime,
    });
    await this.submissionsRepository.save(submission);
    await this.notificationService.createNotification(student, `You have submitted answers for task "${task.title}". Your score is ${score} and time taken is ${attemptTime} ms.`);
    return submission;
  }

  private async generateResultImage(score: number): Promise<string> {
    return `data:image/png;base64,RESULT_IMAGE_BASE64_WITH_SCORE_${score}`;
  }

  async getDailyLeaderboard(): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const submissions = await this.submissionsRepository.
    createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.task', 'task')
      .where('submission.createdAt >= :today', { today })
      .getMany();
    const leaderboard = submissions.map(submission => ({
      studentId: submission.student.id,
      studentName: submission.student.username,
      taskTitle: submission.task.title,
      score: submission.score,
      attemptTime: submission.attemptTime,
    }));
    leaderboard.sort((a, b) => b.score - a.score || a.attemptTime
  - b.attemptTime); // Sort by score desc, then by attempt time asc
    return leaderboard.slice(0, 10); // Return top 10
  }

  async getStudentById(studentId: number): Promise<User> {
    const student = await this.usersRepository.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }   
}
