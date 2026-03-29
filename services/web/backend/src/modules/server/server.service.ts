import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindUserServerDto } from './dto/find-user-server.dto';
import { SyncServerChannelsDto } from './dto/sync-server-channels.dto';
import { UpdateServerSettingsDto } from './dto/update-server-settings.dto';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateServerDto) {
    try {
      return await this.prisma.server.upsert({
        where: { discordServerId: dto.discordServerId },
        update: {
          name: dto.name,
          botAddedAt: dto.botAddedAt,
          botActive: true,
        },
        create: {
          discordServerId: dto.discordServerId,
          name: dto.name,
          botAddedAt: dto.botAddedAt,
          botActive: true,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async findUserServers(dto: FindUserServerDto) {
    try {
      return await this.prisma.server.findMany({
        where: {
          discordServerId: {
            in: dto.discordServerId
          }
        }
      })

    } catch (e) {
      console.error(e)
    }
  }

  async deactivate(discordServerId: string) {
    try {
      return await this.prisma.server.updateMany({
        where: { discordServerId },
        data: { botActive: false },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async findActiveServerIds(): Promise<string[]> {
    try {
      const servers = await this.prisma.server.findMany({
        where: { botActive: true },
        select: { discordServerId: true },
      });
      return servers.map((s) => s.discordServerId);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async bulkDeactivate(discordServerIds: string[]) {
    try {
      return await this.prisma.server.updateMany({
        where: { discordServerId: { in: discordServerIds } },
        data: { botActive: false },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async syncChannels(dto: SyncServerChannelsDto) {
    try {
      const server = await this.prisma.server.upsert({
        where: { discordServerId: dto.discordServerId },
        update: {
          name: dto.name,
          botActive: true,
        },
        create: {
          discordServerId: dto.discordServerId,
          name: dto.name,
          botActive: true,
        },
      });

      const channels = Array.isArray(dto.channels) ? dto.channels : [];
      const channelIds = channels.map((channel) => channel.id);

      await this.prisma.$transaction(async (tx) => {
        if (channelIds.length === 0) {
          await tx.serverChannel.deleteMany({
            where: { serverId: server.id },
          });
        } else {
          await tx.serverChannel.deleteMany({
            where: {
              serverId: server.id,
              discordChannelId: { notIn: channelIds },
            },
          });
        }

        for (const channel of channels) {
          await tx.serverChannel.upsert({
            where: {
              serverId_discordChannelId: {
                serverId: server.id,
                discordChannelId: channel.id,
              },
            },
            update: {
              name: channel.name,
              type: channel.type,
              position: channel.position ?? null,
              parentId: channel.parentId ?? null,
            },
            create: {
              serverId: server.id,
              discordChannelId: channel.id,
              name: channel.name,
              type: channel.type,
              position: channel.position ?? null,
              parentId: channel.parentId ?? null,
            },
          });
        }
      });

      return { ok: true, total: channels.length };
    } catch (e) {
      console.error(e);
      return { ok: false };
    }
  }

  async findChannelsByDiscordServerId(discordServerId: string) {
    try {
      const server = await this.prisma.server.findUnique({
        where: { discordServerId },
        include: { channels: true },
      });

      if (!server) {
        return [];
      }

      return server.channels
        .slice()
        .sort((a, b) => {
          const positionDelta = (a.position ?? 0) - (b.position ?? 0);
          if (positionDelta !== 0) return positionDelta;
          return a.name.localeCompare(b.name);
        })
        .map((channel) => ({
          id: channel.discordChannelId,
          name: channel.name,
          type: channel.type,
          position: channel.position ?? null,
          parentId: channel.parentId ?? null,
        }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async findByDiscordServerId(discordServerId: string) {
    try {
      return await this.prisma.server.findUnique({
        where: { discordServerId },
        select: {
          id: true,
          name: true,
          discordServerId: true,
          discordChannelId: true,
          discordChannelName: true,
          botActive: true,
          botAddedAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Failed to fetch server settings.');
    }
  }

  async updateSettings(discordServerId: string, dto: UpdateServerSettingsDto) {
    try {
      const normalizedName = dto.name?.trim();
      const normalizedChannelId = dto.discordChannelId?.trim() || null;
      let normalizedChannelName = normalizedChannelId ? dto.discordChannelName?.trim() || null : null;

      if (normalizedChannelId) {
        const channel = await this.prisma.serverChannel.findFirst({
          where: {
            discordChannelId: normalizedChannelId,
            server: {
              discordServerId,
            },
          },
          select: {
            name: true,
          },
        });

        if (!channel) {
          throw new BadRequestException('Selecione um canal de voz válido para este servidor.');
        }

        normalizedChannelName = channel.name;
      }

      return await this.prisma.server.upsert({
        where: { discordServerId },
        update: {
          ...(normalizedName ? { name: normalizedName } : {}),
          discordChannelId: normalizedChannelId,
          discordChannelName: normalizedChannelName,
        },
        create: {
          discordServerId,
          name: normalizedName ?? `Servidor ${discordServerId}`,
          discordChannelId: normalizedChannelId,
          discordChannelName: normalizedChannelName,
        },
      });
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }

      console.error(e);
      throw new InternalServerErrorException('Failed to update server settings.');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} server`;
  }
}
