import { Injectable } from '@nestjs/common';
import { request } from 'undici';
import { Server } from './types/discord-guild.type'

@Injectable()
export class DiscordService {

    async findAllManagedServers(accessToken: string) {

        const { body } = await request('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })

        const servers: Server[] = await body.json() as Server[];
        const managedServers: Server[] = servers.filter(server => {
            const perms = BigInt(server.permissions);
            return server.owner || (perms & 0x20n) === 0x20n;
        });

        return managedServers;
    }
}
