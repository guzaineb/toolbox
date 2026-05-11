import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorDocument } from './incubator-document.entity';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { User } from 'src/users/user.entity';

@Injectable()
export class IncubatorDocumentsService {
  constructor(
    @InjectRepository(IncubatorDocument)
    private docRepo: Repository<IncubatorDocument>,
    @InjectRepository(IncubatorMember)
    private memberRepo: Repository<IncubatorMember>,
  ) { }

  async create(incubatorId: string, fileUrl: string, userId: string, documentType: string): Promise<IncubatorDocument> {
    const doc = new IncubatorDocument();
    doc.incubator_id = incubatorId;
    doc.file_url = fileUrl;
    doc.uploaded_by_user = { id: userId } as User;
    doc.document_type = documentType;
    doc.verification_status = 'pending';
    return this.docRepo.save(doc);
  }

  async findByIncubator(incubatorId: string): Promise<any[]> {
    const results = await this.docRepo
      .createQueryBuilder('doc')
      .leftJoin('doc.uploaded_by_user', 'user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('incubator_members', 'member', 'member.user_id = doc.uploaded_by_user_id AND member.incubator_id = doc.incubator_id')
      .where('doc.incubator_id = :incubatorId', { incubatorId })
      .orderBy('doc.uploaded_at', 'DESC')
      .select([
        'doc.id',
        'doc.document_type',
        'doc.file_url',
        'doc.verification_status',
        'doc.rejection_reason',
        'doc.uploaded_at',
        'doc.uploaded_by_user_id',
        'profile.first_name',
        'profile.last_name',
        'member.role',
      ])
      .getRawMany();

    return results.map(row => {
      // Les clés dans row sont sous forme "alias_colonne", par ex "doc_id", "profile_first_name", "member_role"
      const firstName = row['profile_first_name'] || row['first_name'];
      const lastName = row['profile_last_name'] || row['last_name'];
      const role = row['member_role'] || row['role'] || 'membre';
      return {
        id: row.doc_id,
        document_type: row.doc_document_type,
        file_url: row.doc_file_url,
        verification_status: row.doc_verification_status,
        rejection_reason: row.doc_rejection_reason,
        uploaded_at: row.doc_uploaded_at,
        uploaded_by_user_id: row.doc_uploaded_by_user_id,

        uploaded_by: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      };
    });
  }

  async findOne(id: string): Promise<IncubatorDocument> {
    const doc = await this.docRepo.findOne({
      where: { id },
      relations: ['incubator'],
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

    await this.docRepo.remove(doc);
    return { message: 'Document supprimé' };
  }

  async verify(id: string, incubatorId: string, dto: VerifyDocumentDto, userId: string): Promise<IncubatorDocument> {
    await this.assertAdmin(incubatorId, userId);
    const doc = await this.findOne(id);
    doc.verification_status = dto.verification_status;

    if (dto.verification_status === 'rejected') {
      doc.rejection_reason = dto.rejection_reason || null;
    } else {
      doc.rejection_reason = null; // efface la raison si approuvé
    }

    return this.docRepo.save(doc);
  }
  private async assertMember(incubatorId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { incubator_id: incubatorId, user_id: userId },
    });
    if (!member) throw new ForbiddenException('Accès refusé');
  }

  private async assertAdmin(incubatorId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { incubator_id: incubatorId, user_id: userId, role: 'admin' },
    });
    if (!member) {
      throw new ForbiddenException("Seul un administrateur peut vérifier les documents");
    }
  }
}
