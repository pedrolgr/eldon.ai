import { Injectable, Res } from '@nestjs/common';
import dotenv from 'dotenv';
import { request } from 'undici';
dotenv.config()

@Injectable()
export class AuthService {
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

        const oAuthData = body.json();
        
        return oAuthData;

    }

}
