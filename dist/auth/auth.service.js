"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../student/entities/user.entity");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(usersRepository, jwtService) {
        this.usersRepository = usersRepository;
        this.jwtService = jwtService;
    }
    sanitizeUser(user) {
        const { password } = user, sanitizedUser = __rest(user, ["password"]);
        return sanitizedUser;
    }
    async validateUser(username, password) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        return null;
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        let user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = this.usersRepository.create({
                username,
                password: hashedPassword,
                role: user_entity_1.UserRole.ADMIN,
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.id, role: user.role };
        console.log(`User logged in: ${username}, role: ${user.role}`);
        return {
            access_token: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }
    async studentLogin(loginDto) {
        const { username, password } = loginDto;
        const user = await this.usersRepository.findOne({ where: { username, role: user_entity_1.UserRole.STUDENT } });
        if (!user) {
            throw new common_1.UnauthorizedException('Student not found');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map