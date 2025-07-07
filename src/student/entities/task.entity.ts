import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { MCQ } from './mcq.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => User, user => user.id)
  admin: User;

  @OneToMany(() => MCQ, mcq => mcq.task)
  mcqs: MCQ[];
}
