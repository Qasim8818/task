"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const task_entity_1 = require("./entities/task.entity");
const submission_entity_1 = require("./entities/submission.entity");
const mcq_entity_1 = require("./entities/mcq.entity");
const notification_service_1 = require("../notification/notification.service");
const canvas_1 = require("canvas");
let StudentService = class StudentService {
    constructor(usersRepository, tasksRepository, submissionsRepository, mcqRepository, notificationService) {
        this.usersRepository = usersRepository;
        this.tasksRepository = tasksRepository;
        this.submissionsRepository = submissionsRepository;
        this.mcqRepository = mcqRepository;
        this.notificationService = notificationService;
    }
    async getTasks() {
        return this.tasksRepository.find();
    }
    async getMCQsByTask(taskId) {
        return this.mcqRepository.find({ where: { task: { id: taskId } } });
    }
    async startTask(studentId, taskId) {
        const student = await this.usersRepository.findOne({ where: { id: studentId, role: user_entity_1.UserRole.STUDENT } });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const task = await this.tasksRepository.findOne({ where: { id: taskId } });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
    async submitAnswers(submitAnswersDto) {
        const { studentId, taskId, answers } = submitAnswersDto;
        const student = await this.usersRepository.findOne({ where: { id: studentId, role: user_entity_1.UserRole.STUDENT } });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.mcqs', 'mcq')
            .where('task.id = :taskId', { taskId })
            .getOne();
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
        const answersMap = new Map();
        answers.forEach(answer => {
            const mcqId = answer.mcqId !== undefined ? answer.mcqId : answer.id;
            const mcq = task.mcqs.find(m => m.id === mcqId);
            if (!mcq) {
                throw new Error(`Invalid mcqId: ${mcqId}`);
            }
            if (answer.selectedOption < 0 || answer.selectedOption >= mcq.options.length) {
                throw new Error(`Invalid selectedOption for mcqId ${mcqId}: ${answer.selectedOption}`);
            }
            answersMap.set(mcqId, answer.selectedOption);
        });
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
    async generateResultImage(score) {
        const width = 200;
        const height = 100;
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Score: ${score}`, width / 2, height / 2);
        return canvas.toDataURL('image/png');
    }
    async getDailyLeaderboard() {
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
    async getStudentById(studentId) {
        const student = await this.usersRepository.findOne({
            where: { id: studentId, role: user_entity_1.UserRole.STUDENT },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        return student;
    }
    async getWeeklyLeaderboard() {
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
        const studentAttemptCount = new Map();
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
    async getMonthlyLeaderboard() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const submissions = await this.submissionsRepository
            .createQueryBuilder('submission')
            .leftJoinAndSelect('submission.student', 'student')
            .leftJoinAndSelect('submission.task', 'task')
            .where('submission.createdAt >= :startOfMonth', { startOfMonth })
            .getMany();
        const studentStats = new Map();
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
            if (b.taskCount !== a.taskCount)
                return b.taskCount - a.taskCount;
            if (b.totalScore !== a.totalScore)
                return b.totalScore - a.totalScore;
            return a.totalTime - b.totalTime;
        });
        return leaderboard.slice(0, 10);
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(submission_entity_1.Submission)),
    __param(3, (0, typeorm_1.InjectRepository)(mcq_entity_1.MCQ)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], StudentService);
//# sourceMappingURL=student.service.js.map