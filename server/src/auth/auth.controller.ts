import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDTO } from 'src/user/dto/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private userService: UserService, private authService: AuthService) {}

    @Post('register')
    async registerUser(@Body() dto: CreateUserDTO) {
        return await this.userService.create(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDTO) {
        return await this.authService.login(dto);
    }

    @UseGuards(RefreshJwtGuard)
    @Post('refresh')
    async refreshToken(@Request() req: any) {
        return await this.authService.refreshToken(req.user);
    }
}
