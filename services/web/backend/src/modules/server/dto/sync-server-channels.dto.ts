import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SyncServerChannelDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsInt()
    type: number;

    @IsOptional()
    @IsInt()
    position?: number;

    @IsOptional()
    @IsString()
    parentId?: string | null;
}

export class SyncServerChannelsDto {
    @IsString()
    discordServerId: string;

    @IsString()
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncServerChannelDto)
    channels: SyncServerChannelDto[];
}
