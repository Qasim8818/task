import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class MCQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column('simple-array')
  options: string[]; 

  @Column()
  correctOptionIndex: number;

  @ManyToOne(() => Task, (task) => task.mcqs, { onDelete: 'CASCADE' })
  task: Task;
}
