import {Injectable,NotFoundException,ForbiddenException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorDocument } from './incubator-document.entity';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IncubatorDocumentsService {
  constructor(
    @InjectRepository(IncubatorDocument)
    private docRepo: Repository<IncubatorDocument>,
    @InjectRepository(IncubatorMember)
    private memberRepo: Repository<IncubatorMember>,
  ) {}

  async create(incubatorId: string,fileUrl: string,userId: string,documentType: string,): Promise<IncubatorDocument> {
    const doc = this.docRepo.create({
      incubator_id: incubatorId,
      file_url: fileUrl,
      uploaded_by_user_id: userId,
      document_type: documentType,
      verification_status: 'pending',
    });
    return this.docRepo.save(doc);
  }

  async findByIncubator(incubatorId: string): Promise<IncubatorDocument[]> {
    return this.docRepo.find({
      where: { incubator_id: incubatorId },
      order: { uploaded_at: 'DESC' },
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

  async remove(id: string,incubatorId: string,userId: string,): Promise<{ message: string }> {
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

  async verify(id: string,incubatorId: string,dto: VerifyDocumentDto,userId: string,): Promise<IncubatorDocument> {

    await this.assertAdmin(incubatorId, userId);

    const doc = await this.findOne(id);
    doc.verification_status = dto.verification_status;
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
