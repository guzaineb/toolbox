import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class IncubatorDocumentsService {
  constructor(
    private prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) { }

  async create(incubatorId: string, fileUrl: string, userId: string, documentType: string) {
    const doc = await this.prisma.incubatorDocument.create({
      data: {
        incubator_id: incubatorId,
        file_url: fileUrl,
        uploaded_by_user_id: userId,
        document_type: documentType,
        verification_status: 'pending',
      },
    });

    const incubator = await this.prisma.incubator.findUnique({ where: { id: incubatorId }, select: { name: true } });
    const members = await this.prisma.incubatorMember.findMany({
      where: { incubator_id: incubatorId, status: 'active' },
      select: { user_id: true },
    });
    const memberIds = members.map(m => m.user_id).filter(id => id !== userId);
    if (memberIds.length > 0) {
      const { title, message } = this.messageBuilder.documentPending({
        documentType,
        incubatorName: incubator?.name,
      });
      this.eventEmitter.emit(
        NotificationEvent.DOCUMENT_PENDING,
        {
          event: NotificationEvent.DOCUMENT_PENDING,
          recipients: memberIds.map(id => ({ userId: id })),
          title,
          message,
          link: `/incubator/${incubatorId}/documents`,
          senderId: userId,
          resourceType: 'INCUBATOR',
          resourceId: incubatorId,
        } as NotificationPayload,
      );
    }

    return doc;
  }

  async findByIncubator(incubatorId: string): Promise<any[]> {
    const rows = await this.prisma.incubatorDocument.findMany({
      where: { incubator_id: incubatorId },
      include: {
        uploaded_by_user: {
          include: { profile: true },
        },
      },
      orderBy: { uploaded_at: 'desc' },
    });

    return rows.map(row => {
      const profile = row.uploaded_by_user?.profile;
      return {
        id: row.id,
        document_type: row.document_type,
        file_url: row.file_url,
        verification_status: row.verification_status,
        rejection_reason: row.rejection_reason,
        uploaded_at: row.uploaded_at,
        uploaded_by_user_id: row.uploaded_by_user_id,
        uploaded_by: {
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          role: 'membre',
        },
      };
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.incubatorDocument.findUnique({
      where: { id },
      include: { incubator: true },
    });
    if (!doc) throw new NotFoundException('Document introuvable');
    return doc;
  }

  async remove(id: string, incubatorId: string, userId: string,): Promise<{ message: string }> {
    await this.assertMember(incubatorId, userId);
    const doc = await this.findOne(id);

    if (doc.file_url) {
      const filePath = path.join(process.cwd(), doc.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.prisma.incubatorDocument.delete({ where: { id } });
    return { message: 'Document supprimé' };
  }

  async verify(id: string, incubatorId: string, dto: VerifyDocumentDto, userId: string) {
    await this.assertAdmin(incubatorId, userId);
    const doc = await this.findOne(id);

    const result = await this.prisma.incubatorDocument.update({
      where: { id },
      data: {
        verification_status: dto.verification_status,
        rejection_reason: dto.verification_status === 'rejected' ? (dto.rejection_reason || null) : null,
      },
    });

    const { title, message } = this.messageBuilder.documentVerified({ status: dto.verification_status as 'approved' | 'rejected' });
    this.eventEmitter.emit(
      NotificationEvent.DOCUMENT_VERIFIED,
      {
        event: NotificationEvent.DOCUMENT_VERIFIED,
        recipients: [{ userId: doc.uploaded_by_user_id }],
        title,
        message,
        link: `/incubator/${incubatorId}/documents`,
        senderId: userId,
        resourceType: 'INCUBATOR',
        resourceId: incubatorId,
      } as NotificationPayload,
    );

    return result;
  }
  private async assertMember(incubatorId: string, userId: string): Promise<void> {
    const member = await this.prisma.incubatorMember.findFirst({
      where: { incubator_id: incubatorId, user_id: userId },
    });
    if (!member) throw new ForbiddenException('Accès refusé');
  }

  private async assertAdmin(incubatorId: string, userId: string): Promise<void> {
    const member = await this.prisma.incubatorMember.findFirst({
      where: { incubator_id: incubatorId, user_id: userId, role: 'admin' },
    });
    if (!member) {
      throw new ForbiddenException("Seul un administrateur peut vérifier les documents");
    }
  }
}
