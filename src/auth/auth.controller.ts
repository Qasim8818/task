import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

import { UserRole } from '../student/entities/user.entity';

class RegisterDto {
  username: string;
  password: string;
  role: UserRole;
}

class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('register')
  // async register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
