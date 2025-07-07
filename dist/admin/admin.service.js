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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../student/entities/user.entity");
const task_entity_1 = require("../student/entities/task.entity");
const mcq_entity_1 = require("../student/entities/mcq.entity");
const bcrypt = require("bcrypt");
let AdminService = class AdminService {
    constructor(usersRepository, tasksRepository, mcqRepository) {
        this.usersRepository = usersRepository;
        this.tasksRepository = tasksRepository;
        this.mcqRepository = mcqRepository;
    }
    async registerStudent(username, password) {
        const existingUser = await this.usersRepository.findOne({
            where: { username },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException("Username already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            username,
            password: hashedPassword,
            role: user_entity_1.UserRole.STUDENT,
        });
        await this.usersRepository.save(user);
        return { user, message: " Student registered successfully" };
    }
    async uploadTask(title, description, adminId) {
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
            return await this.tasksRepository.save(task);
        }
        catch (error) {
            throw new Error(`Failed to upload task: ${error.message}`);
        }
    }
    async uploadMCQs(taskId, mcqs) {
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
    async getStudents() {
        const students = await this.usersRepository.find({
            where: { role: user_entity_1.UserRole.STUDENT },
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(mcq_entity_1.MCQ)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map