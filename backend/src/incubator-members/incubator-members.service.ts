import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { User } from '../users/user.entity';
import { Incubator } from '../incubators/incubator.entity';

@Injectable()
export class IncubatorMembersService {
  constructor(
    @InjectRepository(IncubatorMember)
    private memberRepo: Repository<IncubatorMember>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Incubator)
    private incubatorRepo: Repository<Incubator>,
  ) {}

  async addMember(incubatorId: string, dto: AddMemberDto, currentUserId: string) {
    // Vérifier que l'utilisateur actuel est admin de cet incubateur
    const currentMember = await this.memberRepo.findOne({
      where: { 
        user: { id: currentUserId },
        incubator: { id: incubatorId }
      },
      relations: ['user', 'incubator']
    });
    if (!currentMember || currentMember.role !== 'admin') {
      throw new ForbiddenException('Only admin can add members');
    }

    // Vérifier que le membre n'existe pas déjà
    const existing = await this.memberRepo.findOne({
      where: {
        user: { id: dto.userId },
        incubator: { id: incubatorId }
      }
    });
    if (existing) throw new BadRequestException('User already member of this incubator');

    // Récupérer les entités User et Incubator
    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new BadRequestException('User not found');
    const incubator = await this.incubatorRepo.findOneBy({ id: incubatorId });
    if (!incubator) throw new BadRequestException('Incubator not found');

    const member = this.memberRepo.create({
      user,
      incubator,
      role: dto.role as any,
      job_title: dto.job_title,
      can_manage_members: dto.can_manage_members || false,
    });
    return this.memberRepo.save(member);
  }

  async findByIncubator(incubatorId: string) {
    return this.memberRepo.find({
      where: { incubator: { id: incubatorId } },
      relations: ['user', 'user.profile'] // pour avoir les infos personnelles
    });
  }
}