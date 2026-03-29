import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { FindUserServerDto } from './dto/find-user-server.dto';
import { DeactivateServerDto } from './dto/deactivate-server.dto';
import { BulkDeactivateServerDto } from './dto/bulk-deactivate-server.dto';
import { SyncServerChannelsDto } from './dto/sync-server-channels.dto';
import { UpdateServerSettingsDto } from './dto/update-server-settings.dto';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) { }

  @Post()
  create(@Body() createServerDto: CreateServerDto) {
    return this.serverService.create(createServerDto);
  }

  @Post('/search')
  findUserServers(@Body() userServersDto: FindUserServerDto) {
    return this.serverService.findUserServers(userServersDto);
  }

  @Get('active')
  findActiveServerIds() {
    return this.serverService.findActiveServerIds();
  }

  @Patch('deactivate')
  deactivate(@Body() body: DeactivateServerDto) {
    return this.serverService.deactivate(body.discordServerId);
  }

  @Patch('bulk-deactivate')
  bulkDeactivate(@Body() body: BulkDeactivateServerDto) {
    return this.serverService.bulkDeactivate(body.discordServerIds);
  }

  @Post('channels/sync')
  syncChannels(@Body() body: SyncServerChannelsDto) {
    return this.serverService.syncChannels(body);
  }

  @Get(':discordServerId/channels')
  findChannels(@Param('discordServerId') discordServerId: string) {
    return this.serverService.findChannelsByDiscordServerId(discordServerId);
  }

  @Get(':discordServerId')
  findOne(@Param('discordServerId') discordServerId: string) {
    return this.serverService.findByDiscordServerId(discordServerId);
  }

  @Patch(':discordServerId/settings')
  updateSettings(
    @Param('discordServerId') discordServerId: string,
    @Body() updateServerSettingsDto: UpdateServerSettingsDto,
  ) {
    return this.serverService.updateSettings(discordServerId, updateServerSettingsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serverService.remove(+id);
  }
}
