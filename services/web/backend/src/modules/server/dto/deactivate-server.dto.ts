import { IsString } from 'class-validator';

export class DeactivateServerDto {

  @IsString()
  discordServerId: string;

}
