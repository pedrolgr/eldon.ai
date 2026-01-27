import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/discord/redirect')
  discordAuthRedirect(@Req() request: Request) {

  }

}
