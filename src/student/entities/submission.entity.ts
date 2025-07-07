import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  student: User;

  @ManyToOne(() => Task, task => task.id)
  task: Task;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  score: number;

  @Column({ type: 'int', nullable: true })
  attemptTime: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}
