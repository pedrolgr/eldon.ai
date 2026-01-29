import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/discord/redirect')
  async discordAuthRedirect(@Query('code') code: string) {

    if (!code) {
      console.error('No code provided!')
    }

    return this.authService.handleDiscordRedirect(code);

  }
}
