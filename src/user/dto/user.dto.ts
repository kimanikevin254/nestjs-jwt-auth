import { IsOptional, IsString } from "class-validator";

export class UserDto {
    @IsString()
    @IsOptional()
    userId?: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    password?: string;
}