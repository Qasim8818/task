import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { MCQ } from './entities/mcq.entity';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { NotificationService } from '../notification/notification.service';
import { createCanvas } from 'canvas';

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

  async startTask(studentId: number, taskId: number): Promise<Submission> {
    const student = await this.usersRepository.findOne({ where: { id: studentId, role: UserRole.STUDENT } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const existingSubmission = await this.submissionsRepository.findOne({ where: { student: { id: studentId }, task: { id: taskId }, score: null } });
    if (existingSubmission) {
      return existingSubmission;
    }

    const submission = this.submissionsRepository.create({
      student,
      task,
      startTime: new Date(),
      imageUrl: '',
      score: null,
      attemptTime: null,
    });
    await this.submissionsRepository.save(submission);
    return submission;
  }

  async submitAnswers(submitAnswersDto: SubmitAnswersDto): Promise<Submission> {
    const { studentId, taskId, answers } = submitAnswersDto;

    const student = await this.usersRepository.findOne({ where: { id: studentId, role: UserRole.STUDENT } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const task = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.mcqs', 'mcq')
      .where('task.id = :taskId', { taskId })
      .getOne();
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.mcqs.length !== answers.length) {
      console.error(`submitAnswers validation failed: task.mcqs.length=${task.mcqs.length}, answers.length=${answers.length}`);
      throw new Error(`Number of answers (${answers.length}) does not match number of questions (${task.mcqs.length})`);
    }

    const submission = await this.submissionsRepository.findOne({ where: { student: { id: studentId }, task: { id: taskId }, score: null } });
    if (!submission) {
      throw new Error('No active submission found. Please start the task first.');
    }

    const startTime = submission.startTime;
    if (!startTime) {
      throw new Error('Start time not found for submission.');
    }

    const endTime = new Date();
    const attemptTime = endTime.getTime() - startTime.getTime();

    // Map answers by mcqId for quick lookup and validate selectedOption
    const answersMap = new Map<number, number>();
    answers.forEach(answer => {
      const mcqId = (answer as any).mcqId !== undefined ? (answer as any).mcqId : (answer as any).id;
      const mcq = task.mcqs.find(m => m.id === mcqId);
      if (!mcq) {
        throw new Error(`Invalid mcqId: ${mcqId}`);
      }
      if (answer.selectedOption < 0 || answer.selectedOption >= mcq.options.length) {
        throw new Error(`Invalid selectedOption for mcqId ${mcqId}: ${answer.selectedOption}`);
      }
      answersMap.set(mcqId, answer.selectedOption);
    });

    // Calculate score
    let score = 0;
    task.mcqs.forEach(mcq => {
      const submittedAnswer = answersMap.get(mcq.id);
      console.log(`MCQ ID: ${mcq.id}, Correct Option: ${mcq.correctOptionIndex}, Submitted: ${submittedAnswer}`);
      if (submittedAnswer !== undefined && submittedAnswer === mcq.correctOptionIndex) {
        score++;
      }
    });

    const imageUrl = await this.generateResultImage(score);

    submission.imageUrl = imageUrl;
    submission.score = score;
    submission.attemptTime = attemptTime;

    await this.submissionsRepository.save(submission);
    await this.notificationService.createNotification(student, `${student.username} has submitted answers for task "${task.title}". Score: ${score}, Time taken: ${attemptTime} ms.`);
    return submission;
  }


  private async generateResultImage(score: number): Promise<string> {
    const width = 200;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Score: ${score}`, width / 2, height / 2);

    // Return base64 image string
    return canvas.toDataURL('image/png');
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
  - b.attemptTime); 
    return leaderboard.slice(0, 10); 
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
    const dayOfWeek = today.getDay(); 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const submissions = await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.task', 'task')
      .where('submission.createdAt >= :startOfWeek', { startOfWeek })
      .getMany();

    const studentAttemptCount = new Map<number, number>();
    submissions.forEach(submission => {
      const count = studentAttemptCount.get(submission.student.id) || 0;
      studentAttemptCount.set(submission.student.id, count + 1);
    });

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
