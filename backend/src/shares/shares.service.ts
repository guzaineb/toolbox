import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ProjectShare } from './project-share.entity';
import { ProjectsService } from '../projects/projects.service';
import { BmcService } from '../bmc/bmc.service';
import { CreateShareDto } from './dto/create-share.dto';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(ProjectShare)
    private shareRepo: Repository<ProjectShare>,
    private projectsService: ProjectsService,
    private bmcService: BmcService,
  ) {}

  async createShare(projectId: string, userId: string, dto: CreateShareDto): Promise<ProjectShare> {
    await this.projectsService.findOne(projectId, userId);

    const share = this.shareRepo.create({
      project_id: projectId,
      share_token: uuidv4(),
      created_by: userId,
      permissions: dto.permissions || {},
      expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
    });

    return this.shareRepo.save(share);
  }

  async getShares(projectId: string): Promise<ProjectShare[]> {
    return this.shareRepo.find({
      where: { project_id: projectId },
      order: { created_at: 'DESC' },
    });
  }

  async revokeShare(shareId: string, userId: string): Promise<{ message: string }> {
    const share = await this.shareRepo.findOneBy({ id: shareId });
    if (!share) throw new NotFoundException('Lien de partage introuvable');

    if (share.created_by !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas le créateur de ce partage');
    }

    share.is_active = false;
    await this.shareRepo.save(share);
    return { message: 'Partage révoqué' };
  }

  async getSharedProject(token: string): Promise<any> {
    const share = await this.validateToken(token);
    const project = await this.projectsService.findOne(share.project_id);
    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        created_at: project.created_at,
      },
      permissions: share.permissions,
    };
  }

  async getSharedBmc(token: string): Promise<any> {
    const share = await this.validateToken(token);
    if (!share.permissions.can_view_bmc) {
      throw new ForbiddenException('Vous n\'avez pas la permission de voir le BMC');
    }
    const bmc = await this.bmcService.getBmc(share.project_id);
    if (!bmc) throw new NotFoundException('Aucun BMC trouvé pour ce projet');
    return { bmc: bmc.blocks, permissions: share.permissions };
  }

  private async validateToken(token: string): Promise<ProjectShare> {
    const share = await this.shareRepo.findOneBy({ share_token: token });
    if (!share) throw new NotFoundException('Lien de partage invalide');
    if (!share.is_active) throw new ForbiddenException('Ce lien de partage a été révoqué');
    if (share.expires_at && new Date() > share.expires_at) {
      throw new ForbiddenException('Ce lien de partage a expiré');
    }
    return share;
  }
}
