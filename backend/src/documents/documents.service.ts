import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectDocument } from './project-document.entity';
import { Project } from '../projects/project.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(ProjectDocument)
    private docRepo: Repository<ProjectDocument>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async upload(
    projectId: string,
    userId: string,
    documentType: string,
    file: Express.Multer.File,
    stepId?: string,
  ): Promise<ProjectDocument> {
    const project = await this.projectRepo.findOneBy({ id: projectId });
    if (!project) throw new NotFoundException('Projet introuvable');

    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'projects', projectId);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

    const doc = this.docRepo.create({
      project_id: projectId,
      document_type: documentType,
      file_url: `/uploads/projects/${projectId}/${filename}`,
      step_id: stepId || null,
      uploaded_by_user_id: userId,
      version: 1,
    } as any);

    return this.docRepo.save(doc) as any;
  }

  async findByProject(projectId: string): Promise<ProjectDocument[]> {
    return this.docRepo.find({
      where: { project_id: projectId },
      order: { uploaded_at: 'DESC' },
    });
  }

  async verify(id: string, status: 'approved' | 'rejected', reason?: string): Promise<ProjectDocument> {
    const doc = await this.docRepo.findOneBy({ id });
    if (!doc) throw new NotFoundException('Document introuvable');
    doc.verification_status = status;
    doc.rejection_reason = reason || null;
    return this.docRepo.save(doc);
  }

  async remove(id: string): Promise<{ message: string }> {
    const doc = await this.docRepo.findOneBy({ id });
    if (!doc) throw new NotFoundException('Document introuvable');
    await this.docRepo.remove(doc);
    return { message: 'Document supprimé' };
  }
}
