import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("admin")
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("register-student")
  async registerStudent(@Body() body: { username: string; password: string }, @Request() req) {
    const { username, password } = body;
    const adminUsername = req.user.username;
    return this.adminService.registerStudent(username, password, adminUsername);
  }

  @Post("upload-task")
  async uploadTask(@Body() body: { title: string; description: string }, @Request() req) {
    const { title, description } = body;
    const adminId = req.user.id;
    return this.adminService.uploadTask(title, description, adminId);
  }

  @Post("upload-mcqs")
  async uploadMCQs(@Body() body: { taskId: number; mcqs: { question: string; options: string[]; correctOptionIndex: number }[] }) {
    const { taskId, mcqs } = body;
    return this.adminService.uploadMCQs(taskId, mcqs);
  }
}
