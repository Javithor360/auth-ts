import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {

    constructor(private userService: UserService, private jwtService: JwtService) {}

    async login(dto: LoginDTO) {
        const user = await this.validateUser(dto);
        const payload = {
            username: user.email,
            sub: {
                name: user.name
            }
        }

        return {
            user,
            backendTokens: {
                accessToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '1m',
                    secret: process.env.JWT_SECRET_KEY
                }),
                refreshToken: await this.jwtService.signAsync(payload, {
                    expiresIn: '7d',
                    secret: process.env.JWT_REFRESH_TOKEN_KEY
                }),
                expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
            }
        }
    }

    async validateUser(dto: LoginDTO) {
        const user = await this.userService.findByEmail(dto.username);
        
        if(user && (await compare(dto.password, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        throw new UnauthorizedException('Credentials are not valid');
    }

    async refreshToken(user: any) {
        const payload = {
            username: user.username,
            sub: user.sub
        };

        return {
            accessToken: await this.jwtService.signAsync(payload, {
                expiresIn: '10s',
                secret: process.env.JWT_SECRET_KEY
            }),
            refreshToken: await this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_TOKEN_KEY
            }),
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        }
    }
}
