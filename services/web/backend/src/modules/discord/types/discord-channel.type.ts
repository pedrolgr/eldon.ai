export interface DiscordChannel {
    id: string,
    name: string,
    type: number,
    position?: number,
    parent_id?: string | null,
}
