import { Repository } from 'typeorm';
import { User } from '../student/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    private sanitizeUser;
    validateUser(username: string, password: string): Promise<User>;
    login(loginDto: LoginDto): Promise<any>;
    studentLogin(loginDto: LoginDto): Promise<any>;
}
