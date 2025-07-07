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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const student_service_1 = require("./student.service");
const auth_service_1 = require("../auth/auth.service");
const submit_answers_dto_1 = require("./dto/submit-answers.dto");
let StudentController = class StudentController {
    constructor(studentService, authService) {
        this.studentService = studentService;
        this.authService = authService;
    }
    async getTasks() {
        return this.studentService.getTasks();
    }
    async getMCQs(taskId) {
        return this.studentService.getMCQsByTask(taskId);
    }
    async submitAnswers(submitAnswersDto) {
        return this.studentService.submitAnswers(submitAnswersDto);
    }
    async login(body) {
        const { username, password } = body;
        return this.authService.studentLogin({ username, password });
    }
    async getDailyLeaderboard() {
        return this.studentService.getDailyLeaderboard();
    }
    async getWeeklyLeaderboard() {
        return this.studentService.getWeeklyLeaderboard();
    }
    async getMonthlyLeaderboard() {
        return this.studentService.getMonthlyLeaderboard();
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('tasks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)('mcqs/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMCQs", null);
__decorate([
    (0, common_1.Post)('submit-answers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_answers_dto_1.SubmitAnswersDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "submitAnswers", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('leaderboard/daily'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getDailyLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/weekly'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getWeeklyLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/monthly'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getMonthlyLeaderboard", null);
exports.StudentController = StudentController = __decorate([
    (0, common_1.Controller)('student'),
    __metadata("design:paramtypes", [student_service_1.StudentService,
        auth_service_1.AuthService])
], StudentController);
//# sourceMappingURL=student.controller.js.map