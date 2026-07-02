import {Injectable,ForbiddenException,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incubator } from './incubator.entity';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
import { UpdateIncubatorDto } from './dto/update-incubator.dto';
import { UpdateStatusDto, UpdateVerificationDto } from './dto/update-status.dto';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { User } from '../users/user.entity';

@Injectable()
export class IncubatorsService {
  constructor(
    @InjectRepository(Incubator)
    private incubatorRepo: Repository<Incubator>,
    @InjectRepository(IncubatorMember)
    private memberRepo: Repository<IncubatorMember>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateIncubatorDto): Promise<Incubator> {
    const existing = await this.incubatorRepo.findOneBy({ slug: dto.slug });
    if (existing) throw new BadRequestException('Ce slug est déjà utilisé');

    const incubator = this.incubatorRepo.create({
      ...dto,
      created_by_user_id: userId,
    });
    const saved = await this.incubatorRepo.save(incubator);

    const adminMember = this.memberRepo.create({
      user_id: userId,
      incubator_id: saved.id,
      role: 'admin',
      is_primary_contact: true,
      can_manage_members: true,
      can_manage_programs: true,
      can_manage_cohorts: true,
      status: 'active',
    });
    await this.memberRepo.save(adminMember);

    return saved;
  }

  async findAll(): Promise<Incubator[]> {
    return this.incubatorRepo.find({ relations: ['members', 'documents'] });
  }

  async findOne(id: string): Promise<Incubator> {
    const incubator = await this.incubatorRepo.findOne({
      where: { id },
      relations: ['members', 'members.user', 'members.user.profile', 'documents'],
    });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');
    return incubator;
  }

  async findByUser(userId: string): Promise<Incubator[]> {
    const members = await this.memberRepo.find({
      where: { user_id: userId },
      relations: ['incubator', 'incubator.members', 'incubator.documents'],
    });
    return members.map((m) => m.incubator).filter(Boolean);
  }

  async update( id: string, dto: UpdateIncubatorDto, userId: string,): Promise<Incubator> {
    await this.assertAdmin(id, userId);
    const incubator = await this.findOne(id);

    if (dto.slug && dto.slug !== incubator.slug) {
      const existing = await this.incubatorRepo.findOneBy({ slug: dto.slug });
      if (existing) throw new BadRequestException('Ce slug est déjà utilisé');
    }

    Object.assign(incubator, dto);
    return this.incubatorRepo.save(incubator);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.assertAdmin(id, userId);
    const incubator = await this.findOne(id);
    await this.incubatorRepo.remove(incubator);
    return { message: 'Incubateur supprimé' };
  }

  async updateStatus(id: string,dto: UpdateStatusDto,userId: string,): Promise<Incubator> {
    await this.assertAdmin(id, userId);
    const incubator = await this.findOne(id);
    incubator.status = dto.status;
    return this.incubatorRepo.save(incubator);
  }

  async updateVerification(id: string,dto: UpdateVerificationDto,userId: string,): Promise<Incubator> {
    // Dans le MVP, l'admin de l'incubateur peut approuver/rejeter
    // En prod, ce sera réservé aux super-admins de la plateforme
    await this.assertAdmin(id, userId);
    const incubator = await this.findOne(id);
    incubator.verification_status = dto.verification_status;
    return this.incubatorRepo.save(incubator);
  }

  // Helper : vérifie que userId est admin de l'incubateur
  private async assertAdmin(incubatorId: string, userId: string): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { incubator_id: incubatorId, user_id: userId, role: 'admin' },
    });
    if (!member) {
      throw new ForbiddenException("Vous n'êtes pas administrateur de cet incubateur");
    }
  }
}
