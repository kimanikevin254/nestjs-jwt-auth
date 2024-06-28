import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenInterface } from './interfaces/tokens.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { User } from 'prisma/prisma-client'

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private prismaService: PrismaService
    ) {}

    async comparePassword(providedPassword: string, userPassword: string): Promise<boolean> {
        return await bcrypt.compare(providedPassword, userPassword)
    }

    async generateJWT(userData: User): Promise<TokenInterface>{
        try {
            const payload = {
                sub: userData.userId,
                email: userData.email
            }
    
            const accessToken = await this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: '1h'
                })
    
            const refreshToken = await this.jwtService.signAsync(payload, {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: '7d'
                })
    
            // Save refresh token to DB
            await this.prismaService.refreshToken.create({
                data: { 
                    userId: userData.userId,
                    refreshToken: refreshToken
                }
            })
    
            return {
                access: accessToken,
                refresh: refreshToken
            }
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)   
        }
    }

    async refreshAccessToken(refreshData: any, refreshToken: string): Promise<TokenInterface> {
        const payload = {
            sub: refreshData.userId,
            email: refreshData.email
        }

        return {
            access: await this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '1h'
            }),
            refresh: refreshToken
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

    async refreshToken(payload: any, refreshTokenValue: string) {
        return await this.refreshAccessToken(payload, refreshTokenValue)
    }

    async logout(refreshToken: string) {
        try {          
            await this.prismaService.refreshToken.update({
                where: { refreshToken: refreshToken },
                data: { isValid: false }
            })

            return
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)  
        }
    }
}
