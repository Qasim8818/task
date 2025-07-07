import { AdminService } from "./admin.service";
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    registerStudent(body: {
        username: string;
        password: string;
    }, req: any): Promise<any>;
    uploadTask(body: {
        title: string;
        description: string;
    }, req: any): Promise<import("../student/entities/task.entity").Task>;
    uploadMCQs(body: {
        taskId: number;
        mcqs: {
            question: string;
            options: string[];
            correctOptionIndex: number;
        }[];
    }): Promise<import("../student/entities/mcq.entity").MCQ[]>;
}
