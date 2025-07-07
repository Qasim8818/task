import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { User } from './student/entities/user.entity';
import { Task } from './student/entities/task.entity';
import { Submission } from './student/entities/submission.entity';
import { MCQ } from './student/entities/mcq.entity';
import { Notification } from './notification/notification.entity';
import { STATUS_CODES } from 'http';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ( configService: ConfigService) => {
        const sslEnabled = configService.get<string>('POSTGRES_SSL') === "true";
        return {
          type: "postgres",
          host: configService.get<string>("POSTGRES_HOST"),
          post: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          entities: [User, Task, Submission, MCQ, Notification],
          synchronize: true,
          ssl: sslEnabled ? { rejectUnauthorized: false } : false
        };
      },
    }),
    AuthModule,
    AdminModule,
    StudentModule,
  ],
})
export class AppModule {}

