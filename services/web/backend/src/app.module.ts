import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DiscordModule } from './modules/discord/discord.module';

@Module({
  imports: [AuthModule,
    DiscordModule
  ]
})
export class AppModule {}
