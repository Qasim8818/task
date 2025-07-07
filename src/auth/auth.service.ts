import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../student/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // async register(registerDto: RegisterDto): Promise<any> {
  //   const { username, password, role } = registerDto;
  //   if (role !== UserRole.ADMIN) {
  //     throw new UnauthorizedException('Only admin can register users');
  //   }
  //   const existingUser = await this.usersRepository.findOne({ where: { username } });
  //   if (existingUser) {
  //     throw new UnauthorizedException('Username already exists');
  //   }
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const user = this.usersRepository.create({
  //     username,
  //     password: hashedPassword,
  //     role,
  //   });
  //   await this.usersRepository.save(user);
  //   return { message: 'User registered successfully' };
  // }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;

    let user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = this.usersRepository.create({
        username,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      await this.usersRepository.save(user);
      const payload = { username: user.username, sub: user.id, role: user.role };
      console.log(`Admin registered and logged in: ${username}, role: ${user.role}`);
      return {
        message: 'Admin registered and logged in successfully',
        registered: true,
        user: this.sanitizeUser(user),
        access_token: this.jwtService.sign(payload),
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log(`Invalid credentials for user: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    console.log(`User logged in: ${username}, role: ${user.role}`);
    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  async studentLogin(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { username, role: UserRole.STUDENT } });
    if (!user) {
      throw new UnauthorizedException('Student not found');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }
}

