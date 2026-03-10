import { Controller, Get, Req, Res } from '@nestjs/common';
import { DiscordService } from './discord.service';
import type { Response, Request } from 'express';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) { }

  @Get('/servers')
  async getAllManagedServers(@Req() req: Request, @Res() res: Response) {

    const token = req.cookies['jwt_token']

    if (!token) {
      console.error('No access token provided');
    }

    return this.discordService.findAllManagedServers(token);

  }
}
