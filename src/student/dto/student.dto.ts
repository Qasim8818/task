import { IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class StudentDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.STUDENT;
}
