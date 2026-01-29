import { Injectable } from '@nestjs/common';
import { request } from 'undici';
import { DiscordGuild } from './types/discord-guild.type'

@Injectable()
export class DiscordService {

    async findAllManagedServers(accessToken: string) {

        const { body } = await request('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })

        const servers: DiscordGuild[] = await body.json() as DiscordGuild[];
        const managedServers: DiscordGuild[] = servers.filter(server => {
            const perms = BigInt(server.permissions);
            return server.owner || (perms & 0x20n) === 0x20n;
        });

        return managedServers;
    }
}
