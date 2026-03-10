import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { JWTService } from '../auth/jwt.service';

@Module({
  controllers: [DiscordController],
  providers: [DiscordService, JWTService],
})
export class DiscordModule { }
