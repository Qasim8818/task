import { Repository } from 'typeorm';
import { User } from '../student/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    private notificationService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService, notificationService: NotificationService);
    private sanitizeUser;
    validateUser(username: string, password: string): Promise<User>;
    login(loginDto: LoginDto): Promise<any>;
    studentLogin(loginDto: LoginDto): Promise<any>;
}
