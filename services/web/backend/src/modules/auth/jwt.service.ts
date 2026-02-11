import { Injectable } from "@nestjs/common";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config()

interface JWTPayload {
    access_token: string,
    expires_in: number
}

@Injectable()
export class JWTService {
    async generateJWT(payload: JWTPayload) {
        return jwt.sign(
            {
                acces_token: payload.access_token
            },
            process.env.JWT_SECRET,
            { expiresIn: payload.expires_in }
        )
    }
}