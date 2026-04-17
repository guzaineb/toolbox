import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incubator } from './incubator.entity';
import { CreateIncubatorDto } from './dto/create-incubator.dto';
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
  ) { }

  async create(userId: string, dto: CreateIncubatorDto): Promise<Incubator> {
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

  async findAll() {
    return this.incubatorRepo.find({ relations: ['members', 'documents'] });
  }

  async findOne(id: string) {
    return this.incubatorRepo.findOne({
      where: { id },
      relations: ['members.user.profile', 'documents'],
    });
  }

  // ✅ AJOUT : récupère les incubateurs dont le user est membre
  async findByUser(userId: string): Promise<Incubator[]> {
    const members = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['incubator', 'incubator.members', 'incubator.documents'],
    });
    return members.map((m) => m.incubator).filter(Boolean);
  }
}