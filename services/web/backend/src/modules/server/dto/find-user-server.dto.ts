import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class FindUserServerDto {

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    discordServerId: string[];

}
