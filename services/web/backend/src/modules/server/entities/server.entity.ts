import { FlaggedMessage } from '@prisma/client';
import { ServerChannel } from '@prisma/client';

export class Server {
    id: string;
    discordServerId: string;
    name: string;
    discordChannelId: string;
    discordChannelName: string | null;
    botActive: boolean;
    botAddedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
    flaggedMessages: FlaggedMessage[];
    channels: ServerChannel[];
}
