import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorDocument } from './incubator-document.entity';

@Injectable()
export class IncubatorDocumentsService {
  constructor(
    @InjectRepository(IncubatorDocument)
    private docRepo: Repository<IncubatorDocument>,
  ) {}

  async create(incubatorId: string, fileUrl: string, userId: string, documentType: string) {
    const doc = this.docRepo.create({
      incubator_id: incubatorId,
      file_url: fileUrl,
      uploaded_by_user_id: userId,
      document_type: documentType,
    });
    return this.docRepo.save(doc);
  }

  async findByIncubator(incubatorId: string) {
    return this.docRepo.find({ where: { incubator_id: incubatorId } });
  }
}