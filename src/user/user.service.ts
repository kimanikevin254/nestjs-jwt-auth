import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService
    ){}

    async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 12)
        } catch (error) {
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async create(createUserDto: CreateUserDto): Promise<User>{
        try {
            const hashedPassword = await this.hashPassword(createUserDto.password)

            return await this.prisma.user.create({
                data: { ...createUserDto, password: hashedPassword }
            })

            // const { password, ...rest } = newUser

            // // Attach tokens to allow user to log in immediately after registration
            // const tokens = await this.authService.generateJWT(newUser)

            // const returnData = {
            //     ...rest,
            //     ...tokens
            // }


            // return returnData
        } catch (error) {
            if(error?.message?.includes('Unique constraint failed on the fields: (`email`)')){
                throw new HttpException('This email address is already registered', HttpStatus.FORBIDDEN)
            } else {
                throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    async findOneByEmail(email: string): Promise<User> {
        const userExists = await this.prisma.user.findUnique({
            where: { email }
        })

        if(!userExists) throw new HttpException('Incorrect credentials', HttpStatus.UNAUTHORIZED)
        
        return userExists
    }
}
