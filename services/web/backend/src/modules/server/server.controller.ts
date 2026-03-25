import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { FindUserServerDto } from './dto/find-user-server.dto';
import { DeactivateServerDto } from './dto/deactivate-server.dto';
import { BulkDeactivateServerDto } from './dto/bulk-deactivate-server.dto';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) { }

  @Post()
  create(@Body() createServerDto: CreateServerDto) {
    return this.serverService.create(createServerDto);
  }

  @Post('/search')
  findUserServers(@Body() userServersDto: FindUserServerDto) {
    console.log(userServersDto)
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto) {
    return this.serverService.update(+id, updateServerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serverService.remove(+id);
  }
}
