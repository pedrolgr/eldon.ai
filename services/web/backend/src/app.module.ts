import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DiscordModule } from './modules/discord/discord.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServerModule } from './modules/server/server.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DiscordModule,
    ServerModule,
  ],
})
export class AppModule {}
