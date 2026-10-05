import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actor_id: params.actorId,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId ?? null,
          metadata: params.metadata ?? Prisma.JsonNull,
        },
      });
    } catch (error) {
      console.error('[AuditService] log failed:', error);
    }
  }
}
