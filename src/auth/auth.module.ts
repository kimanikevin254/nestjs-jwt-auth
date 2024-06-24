import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [AuthService, UserService, PrismaService],
  controllers: [AuthController],
  imports: [
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     global: true,
    //     secret: configService.get<string>('JWT_ACCESS_SECRET'),
    //     signOptions: { expiresIn: '1d' }
    //   })
    // })
    JwtModule.register({
      global: true
    })
  ],
  exports: []
})
export class AuthModule {}
