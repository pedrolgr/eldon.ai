import { IsString } from 'class-validator';

export class OrchestrateAudioDto {
  @IsString()
  discordServerId: string;

  @IsString()
  discordChannelId: string;

  @IsString()
  discordUserId: string;

  @IsString()
  discordUsername: string;
}
