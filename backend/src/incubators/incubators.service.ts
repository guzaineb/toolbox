import {Injectable,ForbiddenException,NotFoundException,BadRequestException,} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { UpdateIncubatorDto } from './dto/update-incubator.dto';
import { UpdateStatusDto, UpdateVerificationDto } from './dto/update-status.dto';

@Injectable()
export class IncubatorsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(userId: string, dto: CreateIncubatorDto) {
    const existing = await this.prisma.incubator.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Ce slug est déjà utilisé');

    const saved = await this.prisma.incubator.create({
      data: {
        ...dto,
        created_by_user_id: userId,
      },
    });

    await this.prisma.incubatorMember.create({
      data: {
        user_id: userId,
        incubator_id: saved.id,
        role: 'admin',
        is_primary_contact: true,
        can_manage_members: true,
        can_manage_programs: true,
        can_manage_cohorts: true,
        status: 'active',
      },
    });

    return saved;
  }

  async findAll() {
    return this.prisma.incubator.findMany({
      include: { members: true, documents: true },
    });
  }

  async findOne(id: string) {
    const incubator = await this.prisma.incubator.findUnique({
      where: { id },
      include: {
        members: { include: { user: { include: { profile: true } } } },
        documents: true,
      },
    });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');
    return incubator;
  }

  async findByUser(userId: string) {
    const members = await this.prisma.incubatorMember.findMany({
      where: { user_id: userId },
      include: {
        incubator: { include: { members: true, documents: true } },
      },
    });
    return members.map((m) => m.incubator).filter(Boolean);
  }

  async update( id: string, dto: UpdateIncubatorDto, userId: string,) {
    await this.assertAdmin(id, userId);

    if (dto.slug) {
      const existing = await this.prisma.incubator.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) throw new BadRequestException('Ce slug est déjà utilisé');
    }

    return this.prisma.incubator.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.assertAdmin(id, userId);
    await this.prisma.incubator.delete({ where: { id } });
    return { message: 'Incubateur supprimé' };
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string,) {
    await this.assertAdmin(id, userId);
    return this.prisma.incubator.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async updateVerification(id: string, dto: UpdateVerificationDto, userId: string,) {
    await this.assertAdmin(id, userId);
    return this.prisma.incubator.update({
      where: { id },
      data: { verification_status: dto.verification_status },
    });
  }

  private async assertAdmin(incubatorId: string, userId: string): Promise<void> {
    const member = await this.prisma.incubatorMember.findFirst({
      where: { incubator_id: incubatorId, user_id: userId, role: 'admin' },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas administrateur de cet incubateur");
    }
  }
}
