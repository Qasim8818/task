"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_service_1 = require("./student.service");
const student_controller_1 = require("./student.controller");
const user_entity_1 = require("./entities/user.entity");
const task_entity_1 = require("./entities/task.entity");
const submission_entity_1 = require("./entities/submission.entity");
const mcq_entity_1 = require("./entities/mcq.entity");
const auth_module_1 = require("../auth/auth.module");
const notification_module_1 = require("../notification/notification.module");
let StudentModule = class StudentModule {
};
exports.StudentModule = StudentModule;
exports.StudentModule = StudentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, task_entity_1.Task, submission_entity_1.Submission, mcq_entity_1.MCQ]), auth_module_1.AuthModule, notification_module_1.NotificationModule],
        providers: [student_service_1.StudentService],
        controllers: [student_controller_1.StudentController],
    })
], StudentModule);
//# sourceMappingURL=student.module.js.map