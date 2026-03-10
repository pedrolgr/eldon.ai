import { Injectable } from '@nestjs/common';
import { request } from 'undici';
import { DiscordGuild } from './types/discord-guild.type';
import { JWTService } from '../auth/jwt.service';

@Injectable()
export class DiscordService {

    constructor(private readonly jwtService: JWTService) { }

    async findAllManagedServers(token: string) {

        const decoded = this.jwtService.decodeJWT(token) as { access_token: string };
        const accessToken = decoded.access_token;

        const { body } = await request('https://discord.com/api/users/@me/guilds', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        })

        const servers: DiscordGuild[] = await body.json() as DiscordGuild[];

        if (!Array.isArray(servers)) {
            console.error('Discord API returned unexpected response:', servers);
            throw new Error('Failed to fetch servers from Discord API');
        }

        const managedServers = servers
            .filter(server => {
                const perms = BigInt(server.permissions);
                return server.owner || (perms & 0x20n) === 0x20n;
            })
            .map(({ banner, permissions, permissions_new, features, icon, ...rest }) => ({
                ...rest,
                icon_url: icon
                    ? `https://cdn.discordapp.com/icons/${rest.id}/${icon}.png?size=1024`
                    : null,
            }));

        return managedServers;
    }
}
