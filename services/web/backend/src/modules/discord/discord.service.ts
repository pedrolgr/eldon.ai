import { Injectable } from '@nestjs/common';
import { request } from 'undici';

@Injectable()
export class DiscordService {

    async findAllManagedServers(accessToken: string) {

        const { body } = await request('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })

        const servers: any = await body.json();
        const managedServers = servers.filter(server => {
            const perms = BigInt(server.permissions);
            return server.owner || (perms & 0x20n) === 0x20n;
        });

        console.log(managedServers)
    }
}
