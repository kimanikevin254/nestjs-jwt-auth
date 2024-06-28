import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor (
        private jwtService: JwtService, 
        private configService: ConfigService,
        private prismaService: PrismaService
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken = this.extractRefreshTokenFromHeader(request)

        if(!refreshToken) { throw new UnauthorizedException() }

        try {
            // Check if refresh token is valid
            // Expired tokens are in the DB(even if they have isValid set to true) will not pass this stage
            await this.jwtService.verifyAsync(
                refreshToken, 
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET')
                }
            )

            // Check if refresh token exists in DB
            const refreshTokenExists = await this.prismaService.refreshToken.findUnique({
                where: { refreshToken: refreshToken, isValid: true }
            })

            if(!refreshTokenExists) { throw new UnauthorizedException() }

            request['refreshToken'] = refreshTokenExists.refreshToken
        } catch (error) {
            throw new UnauthorizedException()
        }

        return true
    }

    private extractRefreshTokenFromHeader(request: Request): string | undefined {
        const refreshHeader = request.headers as { refresh?: string };
        const [type, token] = refreshHeader.refresh?.split(' ') ?? [];
        return type === 'Refresh' ? token : undefined;
    }
}