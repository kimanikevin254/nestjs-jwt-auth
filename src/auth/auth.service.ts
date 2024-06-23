import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenInterface } from './interfaces/tokens.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async comparePassword(providedPassword: string, userPassword: string) {
        return await bcrypt.compare(providedPassword, userPassword)
    }

    async generateJWT(userData: UserDto){
        const payload = {
            sub: userData.userId,
            email: userData.email
        }

        return {
            tokens: {
                access: await this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: '1h'
                }),
                refresh: await this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d'
                })
            }
        }
    }

    async login(loginDto: LoginDto): Promise<TokenInterface> {
        try {
            // Retrieve user
            const user = await this.userService.findOneByEmail(loginDto.email)

            // Check if password is correct
            if(!(user && await this.comparePassword(loginDto.password, user.password))) throw new HttpException('Incorrect credentials', HttpStatus.UNAUTHORIZED)

            // Generate JWT
            const tokens = await this.generateJWT(user)

            return tokens
        } catch (error) {
            throw error
        }
    }

    async refreshToken() {
        // Implement refresh token logic

    }

}
