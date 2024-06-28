import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RefreshGuard } from './refresh.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUser } from './interfaces/return-user.interface';
import { TokenInterface } from './interfaces/tokens.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService
    ) {}

    @Post('register')
    @HttpCode(201)
    async register(@Body() createUserDto: CreateUserDto): Promise<ReturnUser> {
        // Create the user
        const createdUser = await this.userService.create(createUserDto)

        // Attach tokens to allow user to log in immediately after registration
        const tokens = await this.authService.generateJWT(createdUser)

        const { userId, name, email } = createdUser

        return {
            userId, name, email, tokens
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<TokenInterface> {
        return await this.authService.login(loginDto)
    }

    @UseGuards(AuthGuard, RefreshGuard)
    @Get('token/refresh')
    async refresh(@Req() req): Promise<TokenInterface>{
        return await this.authService.refreshToken(req.user, req.refreshToken)
    }

    @Get('logout')
    @UseGuards(AuthGuard, RefreshGuard)
    @HttpCode(200)
    async logout(@Req() req){
        return await this.authService.logout(req.refreshToken)
    }
}
