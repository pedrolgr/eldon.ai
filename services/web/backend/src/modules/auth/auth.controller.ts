import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';

interface DiscordOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JWTService) { }

  @Get('/discord/redirect')
  async discordAuthRedirect(@Query('code') code: string, @Res() res: Response) {

    if (!code) {
      console.error('No code provided!')
    }

    try {
      const oAuthData = await this.authService.handleDiscordRedirect(code) as DiscordOAuthResponse;
      const jwt = await this.jwtService.generateJWT(oAuthData);

      res.cookie('jwt_token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: oAuthData.expires_in * 1000,
        sameSite: 'lax',
        path: '/',
      });

      return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');

    } catch (error) {
      console.error(error);
    }

  }

  @Get('/validate')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['jwt_token']

    const decodedData = await this.authService.handleJwtValidation(token);

    if (!decodedData) {
      return res.status(401).json({ message: 'Não autorizado', isValid: false });
    }

    return res.json({
      isValid: true,
      data: decodedData
    });
  }
}
