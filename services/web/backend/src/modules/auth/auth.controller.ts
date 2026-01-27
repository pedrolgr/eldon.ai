import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {

    @Get("/discord/redirect/")
        discordRedirect(@Req() reqquest: Request){
            
        }
}
