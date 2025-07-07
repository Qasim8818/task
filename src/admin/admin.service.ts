import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "../student/entities/user.entity";
import { Task } from "../student/entities/task.entity";
import { MCQ } from "../student/entities/mcq.entity";
import * as bcrypt from "bcrypt";
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(MCQ)
    private mcqRepository: Repository<MCQ>,
    private notificationService: NotificationService,
  ) {}

  async registerStudent(username: string, password: string): Promise<any> {
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new UnauthorizedException("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      role: UserRole.STUDENT,
    });
    await this.usersRepository.save(user);
    await this.notificationService.createNotification(user, `You have been registered by admin with username: ${user.role}. Your username is ${user} and your password is the one you set.`);
    return { user, message: " Student registered successfully" };
  }

  async uploadTask(
    title: string,
    description: string,
    adminId: number
  ): Promise<Task> {
    try {
      const admin = await this.usersRepository.findOne({ where: { id: adminId } });
      if (!admin) {
        throw new Error('Admin user not found');
      }
      const task = this.tasksRepository.create({
        title,
        description,
        admin,
      });
      await this.notificationService.createNotification(admin, `Task "${title}" uploaded successfully.`);
      return await this.tasksRepository.save(task);
    } catch (error) {
      throw new Error(`Failed to upload task: ${error.message}`);
    }
  }

  async uploadMCQs(taskId: number, mcqs: { question: string; options: string[]; correctOptionIndex: number }[]): Promise<MCQ[]> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new Error('Task not found');
    }

    const mcqEntities = mcqs.map(mcq => {
      return this.mcqRepository.create({
        question: mcq.question,
        options: mcq.options,
        correctOptionIndex: mcq.correctOptionIndex,
        task,
      });
    });

    return this.mcqRepository.save(mcqEntities);
  }

  async getStudents(): Promise<any[]> {
    const students = await this.usersRepository.find({
      where: { role: UserRole.STUDENT },
      relations: ['submissions', 'submissions.task'],
    });

    return students.map(student => {
      const tasksAttempted = student.submissions ? student.submissions.length : 0;
      const resultsSummary = student.submissions ? student.submissions.map(sub => ({
        taskTitle: sub.task.title,
        score: sub.score,
      })) : [];
      return {
        username: student.username,
        tasksAttempted,
        resultsSummary,
      };
    });
  }
}
