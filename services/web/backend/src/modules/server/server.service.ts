import { Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindUserServerDto } from './dto/find-user-server.dto';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateServerDto) {
    try {
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

  async findUserServers(dto: FindUserServerDto) {
    try {
      return await this.prisma.server.findMany({
        where: {
          id: {
            in: dto.discordServerId
          }
        }
      })

    } catch (e) {
      console.error(e)
    }
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
