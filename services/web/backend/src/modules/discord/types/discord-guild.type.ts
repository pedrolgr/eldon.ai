export interface DiscordGuild {
    id: string,
    name: string,
    icon: string,
    banner: string,
    owner: boolean,
    permissions: number,
    permissions_mew: string,
    features: string[],
}