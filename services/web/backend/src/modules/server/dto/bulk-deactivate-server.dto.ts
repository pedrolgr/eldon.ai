import { IsArray, IsString } from 'class-validator';

export class BulkDeactivateServerDto {
  @IsArray()
  @IsString({ each: true })
  discordServerIds: string[];
}
