import { Controller, Get, Headers } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Get('/servers')
  async getAllManagedServers(@Headers('authorization') accessToken: string){
    
    if(!accessToken) {
      console.error('No access token provided');
    }

    return this.discordService.findAllManagedServers(accessToken);

  }
}
