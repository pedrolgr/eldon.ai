import { Controller, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { DiscordService } from './discord.service';
import type { Response, Request } from 'express';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) { }

  @Get('/servers')
  async getAllManagedServers(@Req() req: Request, @Res() res: Response) {

    const token = req.cookies['jwt_token']

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No JWT token provided' });
    }

    const servers = await this.discordService.findAllManagedServers(token);
    return res.status(HttpStatus.OK).json(servers);

  }
}
