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
    async submitAnswers(submitAnswersDto) {
        const { studentId, taskId, answers, startTime, endTime } = submitAnswersDto;
        const attemptTime = endTime - startTime;
        const student = await this.usersRepository.findOne({ where: { id: studentId, role: user_entity_1.UserRole.STUDENT } });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        const task = await this.tasksRepository.findOne({ where: { id: taskId }, relations: ['mcqs'] });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
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
    async generateResultImage(score) {
        return `data:image/png;base64,RESULT_IMAGE_BASE64_WITH_SCORE_${score}`;
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