import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthService } from '../auth/auth.service';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly authService: AuthService,
  ) {}

  @Get('tasks')
  async getTasks() {
    return this.studentService.getTasks();
  }

  @Get('mcqs/:taskId')
  async getMCQs(@Param('taskId') taskId: number) {
    return this.studentService.getMCQsByTask(taskId);
  }

  @Post('submit-answers')
  async submitAnswers(@Body() submitAnswersDto: SubmitAnswersDto) {
    return this.studentService.submitAnswers(submitAnswersDto);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    // Call a separate student login method in authService
    return this.authService.studentLogin({ username, password });
  }
}
