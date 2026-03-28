import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateServerSettingsDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    discordChannelId?: string;

    @IsOptional()
    @IsString()
    discordChannelName?: string;

    @IsOptional()
    @IsBoolean()
    botActive?: boolean;
}
