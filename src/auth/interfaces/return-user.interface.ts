import { TokenInterface } from "./tokens.interface";

export interface ReturnUser {
    userId: string;
    name: string;
    email: string;
    tokens: TokenInterface;
}