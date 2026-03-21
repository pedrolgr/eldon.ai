import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateServerDto) {
    try {
      console.log(dto.name)
      return await this.prisma.server.create({
        data: {
          discordServerId: dto.discordServerId,
          name: dto.name,
          botAddedAt: dto.botAddedAt,
          botActive: true,
        }
      })
    } catch (e) {
      console.error(e)
    }

  }

  findAll() {
    return `This action returns all server`;
  }

  findOne(id: number) {
    return `This action returns a #${id} server`;
  }

  update(id: number, updateServerDto: UpdateServerDto) {
    return `This action updates a #${id} server`;
  }

  remove(id: number) {
    return `This action removes a #${id} server`;
  }
}
