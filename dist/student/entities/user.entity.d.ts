import { Submission } from './submission.entity';
export declare const UserRole: {
    readonly ADMIN: "admin";
    readonly STUDENT: "student";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare class User {
    id: number;
    username: string;
    password: string;
    role: string;
    submissions: Submission[];
}
