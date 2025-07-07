import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Submission } from './submission.entity';
import { Notification } from '../../notification/notification.entity';

export const UserRole = {
  ADMIN: 'admin',
  STUDENT: 'student',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @OneToMany(() => Submission, submission => submission.student) submissions: Submission[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
}
