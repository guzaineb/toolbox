import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IncubatorDocumentsService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async create(incubatorId: string, fileUrl: string, userId: string, documentType: string) {
    return this.prisma.incubatorDocument.create({
      data: {
        incubator_id: incubatorId,
        file_url: fileUrl,
        uploaded_by_user_id: userId,
        document_type: documentType,
        verification_status: 'pending',
      },
    });
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

    return this.prisma.incubatorDocument.update({
      where: { id },
      data: {
        verification_status: dto.verification_status,
        rejection_reason: dto.verification_status === 'rejected' ? (dto.rejection_reason || null) : null,
      },
    });
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
