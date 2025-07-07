import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from "./student.service"
import { StudentController } from "./student.controller"
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Submission } from './entities/submission.entity';
import { MCQ } from './entities/mcq.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Submission, MCQ]), AuthModule],
  providers: [StudentService],
  controllers: [StudentController],
})
export class StudentModule {}
