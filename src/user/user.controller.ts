import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';
import { UserInterface } from './interface/user.interface';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @UseGuards(AuthGuard)
    async profile(@Request() req): Promise<UserInterface> {
        const user = await this.userService.findOneByEmail(req.user.email)
        const { password, ...rest } = user
        return rest
    }
}
