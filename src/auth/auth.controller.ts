import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RefreshGuard } from './refresh.guard';

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

    @UseGuards(AuthGuard, RefreshGuard)
    @Get('token/refresh')
    async refresh(@Req() req){
        return this.authService.refreshToken(req.user, req.refreshToken)
    }
}
