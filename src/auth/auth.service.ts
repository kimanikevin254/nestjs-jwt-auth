import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenInterface } from './interfaces/token.interface';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
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
            token: {
                access: await this.jwtService.signAsync(payload)
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
            const token = await this.generateJWT(user)

            return token
        } catch (error) {
            throw error
        }
    }

}
