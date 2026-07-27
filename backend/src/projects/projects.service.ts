import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string; description?: string }) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        owner_id: userId,
      },
    });
  }

  async findByOwner(userId: string) {
    return this.prisma.project.findMany({
      where: { owner_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOwnedOrThrow(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.owner_id !== userId) throw new ForbiddenException('Vous n\'êtes pas le propriétaire de ce projet');
    return project;
  }

  async search(query: string) {
    if (!query || query.trim().length === 0) return [];

    return this.prisma.project.findMany({
      where: {
        name: { contains: query.trim(), mode: 'insensitive' },
      },
      select: { id: true, name: true, description: true, owner_id: true },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }
}
