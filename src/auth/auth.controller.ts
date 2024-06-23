import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() userDto: UserDto): Promise<UserDto> {
        return this.userService.create(userDto)
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<any> {
        return this.authService.login(loginDto)
    }
}
