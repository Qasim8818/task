import { IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../student/entities/user.entity';

export class RegisterDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
