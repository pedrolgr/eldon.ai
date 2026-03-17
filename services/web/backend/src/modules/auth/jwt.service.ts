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
                access_token: payload.access_token
            },
            process.env.JWT_SECRET as string,
            { expiresIn: payload.expires_in }
        )
    }

    async validateJWT(token: string) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    decodeJWT(token: string) {
        const decoded = jwt.decode(token);
        if (!decoded) {
            throw new Error('Failed to decode token');
        }
        return decoded;
    }
}