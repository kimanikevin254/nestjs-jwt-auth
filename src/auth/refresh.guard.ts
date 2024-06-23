import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor (private jwtService: JwtService, private configService: ConfigService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken = this.extractRefreshTokenFromHeader(request)

        if(!refreshToken) { throw new UnauthorizedException() }

        try {
            await this.jwtService.verifyAsync(
                refreshToken, 
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET')
                }
            )

            request['refreshToken'] = refreshToken
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