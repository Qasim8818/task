export declare enum UserRole {
    ADMIN = "admin",
    STUDENT = "student"
}
export declare class User {
    id: number;
    username: string;
    password: string;
    role: UserRole;
}
