import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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
}
