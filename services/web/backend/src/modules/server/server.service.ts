import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindUserServerDto } from './dto/find-user-server.dto';
import { SyncServerChannelsDto } from './dto/sync-server-channels.dto';
import { UpdateServerSettingsDto } from './dto/update-server-settings.dto';
import { OrchestrateAudioDto } from './dto/orchestrate-audio.dto';

interface GroqTranscriptionResponse {
  text?: string;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface ModerationDecision {
  isInappropriate: boolean;
  reason: string | null;
}

interface UploadedAudioFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface FlaggedMessageListItem {
  id: string;
  discordUserId: string;
  discordUsername: string;
  discordChannelId: string;
  originalText: string;
  reason: string | null;
  reviewed: boolean;
  reviewedAt: Date | null;
  createdAt: Date;
}

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

  async orchestrateAudio(dto: OrchestrateAudioDto, audio: UploadedAudioFile) {
    const discordServerId = dto.discordServerId?.trim();
    const discordChannelId = dto.discordChannelId?.trim();
    const discordUserId = dto.discordUserId?.trim();
    const discordUsername = dto.discordUsername?.trim();

    if (!discordServerId || !discordChannelId || !discordUserId || !discordUsername) {
      throw new BadRequestException('discordServerId, discordChannelId, discordUserId e discordUsername são obrigatórios.');
    }

    if (!audio?.buffer?.length) {
      throw new BadRequestException('Audio MP3 é obrigatório.');
    }

    if (!audio.mimetype?.startsWith('audio/')) {
      throw new BadRequestException('O arquivo enviado precisa ser de áudio.');
    }

    const server = await this.prisma.server.upsert({
      where: { discordServerId },
      update: { botActive: true },
      create: {
        discordServerId,
        name: `Servidor ${discordServerId}`,
        botActive: true,
      },
    });

    const transcription = await this.transcribeWithGroq(
      audio.buffer,
      audio.originalname || `audio-${Date.now()}.mp3`,
      audio.mimetype || 'audio/mpeg',
    );
    const moderation = await this.classifyForUnderageSafety(transcription);

    if (!moderation.isInappropriate) {
      return {
        transcription,
        isInappropriate: false,
        reason: null,
        savedFlaggedMessage: false,
      };
    }

    const flaggedMessage = await this.prisma.flaggedMessage.create({
      data: {
        serverId: server.id,
        discordUserId,
        discordUsername,
        discordChannelId,
        originalText: transcription,
        reason: moderation.reason ?? 'Conteúdo inadequado para menores de 18 anos.',
        audioMp3: new Uint8Array(audio.buffer),
      },
      select: { id: true },
    });

    return {
      transcription,
      isInappropriate: true,
      reason: moderation.reason,
      savedFlaggedMessage: true,
      flaggedMessageId: flaggedMessage.id,
    };
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

  async findFlaggedMessagesByDiscordServerId(discordServerId: string): Promise<FlaggedMessageListItem[]> {
    try {
      const server = await this.prisma.server.findUnique({
        where: { discordServerId },
        select: { id: true },
      });

      if (!server) {
        return [];
      }

      return await this.prisma.flaggedMessage.findMany({
        where: { serverId: server.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          discordUserId: true,
          discordUsername: true,
          discordChannelId: true,
          originalText: true,
          reason: true,
          reviewed: true,
          reviewedAt: true,
          createdAt: true,
        },
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async findFlaggedMessageAudio(discordServerId: string, flaggedMessageId: string) {
    try {
      return await this.prisma.flaggedMessage.findFirst({
        where: {
          id: flaggedMessageId,
          server: {
            discordServerId,
          },
        },
        select: {
          audioMp3: true,
        },
      });
    } catch (e) {
      console.error(e);
      return null;
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

  private getGroqApiKey(): string {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY não configurada no backend.');
    }

    return apiKey;
  }

  private async transcribeWithGroq(
    audioBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    const apiKey = this.getGroqApiKey();

    const formData = new FormData();
    formData.set('file', new Blob([new Uint8Array(audioBuffer)], { type: mimeType }), filename);
    formData.set('model', 'whisper-large-v3');
    formData.set('language', 'pt');
    formData.set('temperature', '0');
    formData.set('response_format', 'verbose_json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(`Erro ao transcrever áudio no Groq (${response.status}): ${error}`);
    }

    const data = (await response.json()) as GroqTranscriptionResponse;
    return data.text?.trim() || '';
  }

  private async classifyForUnderageSafety(text: string): Promise<ModerationDecision> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      return {
        isInappropriate: false,
        reason: null,
      };
    }

    const apiKey = this.getGroqApiKey();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Classifique se um texto é impróprio para menores de 18 anos. Responda somente JSON no formato {"classification":"SAFE|INAPPROPRIATE","reason":"motivo curto"} sem texto extra.',
          },
          {
            role: 'user',
            content: normalizedText,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(
        `Erro ao classificar transcrição no Groq (${response.status}): ${error}`,
      );
    }

    const data = (await response.json()) as GroqChatCompletionResponse;
    const modelOutput = data.choices?.[0]?.message?.content?.trim() || '';
    return this.parseModerationOutput(modelOutput);
  }

  private parseModerationOutput(modelOutput: string): ModerationDecision {
    if (!modelOutput) {
      return {
        isInappropriate: false,
        reason: null,
      };
    }

    try {
      const parsed = JSON.parse(modelOutput) as {
        classification?: string;
        reason?: string;
        isInappropriate?: boolean;
      };
      const classification = parsed.classification?.toUpperCase();
      const isInappropriate = classification === 'INAPPROPRIATE' || parsed.isInappropriate === true;

      return {
        isInappropriate,
        reason: parsed.reason?.trim() || null,
      };
    } catch {
      const fallback = modelOutput.toUpperCase();
      const isInappropriate = fallback.includes('INAPPROPRIATE');

      return {
        isInappropriate,
        reason: isInappropriate ? modelOutput.slice(0, 240) : null,
      };
    }
  }
}
