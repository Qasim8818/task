import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../student/entities/user.entity';
import { Task } from '../student/entities/task.entity';
import { MCQ } from '../student/entities/mcq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, MCQ])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
