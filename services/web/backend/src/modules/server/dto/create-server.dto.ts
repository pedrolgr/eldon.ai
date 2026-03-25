import { IsString, IsDate } from 'class-validator';

export class CreateServerDto {

    @IsString()
    discordServerId: string;

    @IsString()
    name: string;

    @IsDate()
    botAddedAt: Date;

}
