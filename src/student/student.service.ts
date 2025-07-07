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

  async getWeeklyLeaderboard(): Promise<any[]> {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const submissions = await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.task', 'task')
      .where('submission.createdAt >= :startOfWeek', { startOfWeek })
      .getMany();

    // Filter students who attempted daily tasks all week
    const studentAttemptCount = new Map<number, number>();
    submissions.forEach(submission => {
      const count = studentAttemptCount.get(submission.student.id) || 0;
      studentAttemptCount.set(submission.student.id, count + 1);
    });

    // Assuming 7 daily tasks in a week
    const fullWeekStudents = Array.from(studentAttemptCount.entries())
      .filter(([_, count]) => count >= 7)
      .map(([studentId, _]) => studentId);

    const leaderboard = submissions
      .filter(submission => fullWeekStudents.includes(submission.student.id))
      .map(submission => ({
        studentId: submission.student.id,
        studentName: submission.student.username,
        taskTitle: submission.task.title,
        score: submission.score,
        attemptTime: submission.attemptTime,
      }));

    leaderboard.sort((a, b) => b.score - a.score || a.attemptTime - b.attemptTime);
    return leaderboard.slice(0, 10);
  }

  async getMonthlyLeaderboard(): Promise<any[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const submissions = await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.task', 'task')
      .where('submission.createdAt >= :startOfMonth', { startOfMonth })
      .getMany();

    // Aggregate scores and attempt times per student
    const studentStats = new Map<number, { totalScore: number; totalTime: number; taskCount: number }>();
    submissions.forEach(submission => {
      const stats = studentStats.get(submission.student.id) || { totalScore: 0, totalTime: 0, taskCount: 0 };
      stats.totalScore += submission.score;
      stats.totalTime += submission.attemptTime;
      stats.taskCount += 1;
      studentStats.set(submission.student.id, stats);
    });

    const leaderboard = Array.from(studentStats.entries()).map(([studentId, stats]) => ({
      studentId,
      totalScore: stats.totalScore,
      totalTime: stats.totalTime,
      taskCount: stats.taskCount,
    }));

    leaderboard.sort((a, b) => {
      if (b.taskCount !== a.taskCount) return b.taskCount - a.taskCount;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.totalTime - b.totalTime;
    });

    return leaderboard.slice(0, 10);
  }
}
