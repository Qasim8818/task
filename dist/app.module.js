"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const student_module_1 = require("./student/student.module");
const user_entity_1 = require("./student/entities/user.entity");
const task_entity_1 = require("./student/entities/task.entity");
const submission_entity_1 = require("./student/entities/submission.entity");
const mcq_entity_1 = require("./student/entities/mcq.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const sslEnabled = configService.get('POSTGRES_SSL') === "true";
                    return {
                        type: "postgres",
                        host: configService.get("POSTGRES_HOST"),
                        post: configService.get('POSTGRES_PORT'),
                        username: configService.get('POSTGRES_USER'),
                        password: configService.get('POSTGRES_PASSWORD'),
                        database: configService.get('POSTGRES_DB'),
                        entities: [user_entity_1.User, task_entity_1.Task, submission_entity_1.Submission, mcq_entity_1.MCQ],
                        synchronize: true,
                        ssl: sslEnabled ? { rejectUnauthorized: false } : false
                    };
                },
            }),
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            student_module_1.StudentModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map