import { Injectable, Res } from '@nestjs/common';
import dotenv from 'dotenv';
import { request } from 'undici';
import { JWTService } from './jwt.service';

dotenv.config()

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JWTService) { }

    async handleDiscordRedirect(code: string) {

        const payload = new URLSearchParams({
            client_id: process.env.CLIENT_ID as string,
            client_secret: process.env.CLIENT_SECRET as string,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.REDIRECT_URI as string,
        }).toString();

        const { statusCode, body } = await request('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payload).toString(),
            },
            body: payload,
        })

        if (statusCode !== 200) {
            console.error('Error Discord OAuth')
        }

        const oAuthData = await body.json();

        return oAuthData;

    }

    async handleJwtValidation(token: string) {
        if (!token) {
            return null;
        }

        try {
            const decoded = await this.jwtService.validateJWT(token);
            return decoded;
        } catch (error) {
            console.error('JWT Validation Error:', error);
            return null;
        }
    }
}
