import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { FindUserServerDto } from './dto/find-user-server.dto';
import { DeactivateServerDto } from './dto/deactivate-server.dto';
import { BulkDeactivateServerDto } from './dto/bulk-deactivate-server.dto';
import { SyncServerChannelsDto } from './dto/sync-server-channels.dto';
import { UpdateServerSettingsDto } from './dto/update-server-settings.dto';
import { OrchestrateAudioDto } from './dto/orchestrate-audio.dto';
import type { Response } from 'express';

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

  @Post('audio/orchestrate')
  @UseInterceptors(FileInterceptor('audio'))
  orchestrateAudio(
    @Body() body: OrchestrateAudioDto,
    @UploadedFile() audio: { buffer: Buffer; mimetype: string; originalname: string },
  ) {
    return this.serverService.orchestrateAudio(body, audio);
  }

  @Get(':discordServerId/channels')
  findChannels(@Param('discordServerId') discordServerId: string) {
    return this.serverService.findChannelsByDiscordServerId(discordServerId);
  }

  @Get(':discordServerId/flagged-messages')
  findFlaggedMessages(@Param('discordServerId') discordServerId: string) {
    return this.serverService.findFlaggedMessagesByDiscordServerId(discordServerId);
  }

  @Get(':discordServerId/flagged-messages/:flaggedMessageId/audio')
  async findFlaggedMessageAudio(
    @Param('discordServerId') discordServerId: string,
    @Param('flaggedMessageId') flaggedMessageId: string,
    @Res() res: Response,
  ) {
    const data = await this.serverService.findFlaggedMessageAudio(discordServerId, flaggedMessageId);

    if (!data) {
      throw new NotFoundException('Áudio da mensagem sinalizada não encontrado.');
    }

    const audioBuffer = Buffer.from(data.audioMp3);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', String(audioBuffer.byteLength));
    res.send(audioBuffer);
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
