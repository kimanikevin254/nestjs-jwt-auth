import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 12)
        } catch (error) {
            console.log('ERROR', error);
        }
    }

    async create(userDto: UserDto): Promise<UserDto>{
        try {
            const hashedPassword = await this.hashPassword(userDto.password)

            const newUser = await this.prisma.user.create({
                data: { ...userDto, password: hashedPassword }
            })

            const { password, ...rest } = newUser

            return rest
        } catch (error) {
            if(error?.message?.includes('Unique constraint failed on the fields: (`email`)')){
                throw new HttpException('This email address is already registered', HttpStatus.FORBIDDEN)
            } else {
                throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    async findOneByEmail(email: string): Promise<UserDto> {
        const userExists = await this.prisma.user.findUnique({
            where: { email }
        })

        if(!userExists) throw new HttpException('Incorrect credentials', HttpStatus.UNAUTHORIZED)
        
        return userExists
    }
}
