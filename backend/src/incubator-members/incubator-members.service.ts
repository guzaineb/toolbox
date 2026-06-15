import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { IncubatorInvitation } from './incubator-invitation.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { User } from '../users/user.entity';
import { Incubator } from '../incubators/incubator.entity';
import { AcceptInviteDto, InviteMemberDto } from './dto/invite-member.dto';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class IncubatorMembersService {
  constructor(
    @InjectRepository(IncubatorMember)
    private memberRepo: Repository<IncubatorMember>,
    @InjectRepository(IncubatorInvitation)
    private invitationRepo: Repository<IncubatorInvitation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Incubator)
    private incubatorRepo: Repository<Incubator>,
    private emailService: MailService,
  ) {}

  async addMember(
    incubatorId: string,
    dto: AddMemberDto,
    currentUserId: string,
  ): Promise<IncubatorMember> {
    await this.assertCanManageMembers(incubatorId, currentUserId);

    const existing = await this.memberRepo.findOne({
      where: { user_id: dto.userId, incubator_id: incubatorId },
    });
    if (existing) throw new BadRequestException('Cet utilisateur est déjà membre');

    const user = await this.userRepo.findOneBy({ id: dto.userId });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const incubator = await this.incubatorRepo.findOneBy({ id: incubatorId });
    if (!incubator) throw new BadRequestException('Incubateur introuvable');

    const member = this.memberRepo.create({
      user_id: dto.userId,
      incubator_id: incubatorId,
      role: dto.role as any,
      job_title: dto.job_title,
      can_manage_members: dto.can_manage_members || false,
      status: 'active',
    });
    return this.memberRepo.save(member);
  }

  async findByIncubator(incubatorId: string): Promise<IncubatorMember[]> {
    return this.memberRepo.find({
      where: { incubator_id: incubatorId },
      relations: ['user', 'user.profile'],
    });
  }

  async getMyMembership(
    incubatorId: string,
    userId: string,
  ): Promise<IncubatorMember> {
    const member = await this.memberRepo.findOne({
      where: { incubator_id: incubatorId, user_id: userId },
      relations: ['user', 'user.profile', 'incubator'],
    });
    if (!member) throw new NotFoundException('Vous n\'êtes pas membre de cet incubateur');
    return member;
  }

  async updateMember(
    memberId: string,
    incubatorId: string,
    dto: UpdateMemberDto,
    currentUserId: string,
  ): Promise<IncubatorMember> {
    await this.assertCanManageMembers(incubatorId, currentUserId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, incubator_id: incubatorId },
    });
    if (!member) throw new NotFoundException('Membre introuvable');

    if (dto.role && dto.role !== 'admin' && member.role === 'admin') {
      const adminCount = await this.memberRepo.count({
        where: { incubator_id: incubatorId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException("Il doit rester au moins un administrateur");
      }
    }

    Object.assign(member, dto);
    return this.memberRepo.save(member);
  }

  async removeMember(memberId: string, incubatorId: string, currentUserId: string): Promise<{ message: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);
    const member = await this.memberRepo.findOne({
      where: { id: memberId, incubator_id: incubatorId },
    });
    if (!member) throw new NotFoundException('Membre introuvable');

    if (member.role === 'admin') {
      const adminCount = await this.memberRepo.count({
        where: { incubator_id: incubatorId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException("Impossible de supprimer le seul administrateur");
      }
    }

    if (member.user_id === currentUserId) {
      throw new BadRequestException("Vous ne pouvez pas vous retirer vous-même");
    }

    await this.memberRepo.remove(member);
    return { message: 'Membre supprimé' };
  }

  async inviteMember(
    incubatorId: string,
    dto: InviteMemberDto,
    currentUserId: string,
  ): Promise<{ message: string; token?: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);
    
    const incubator = await this.incubatorRepo.findOneBy({ id: incubatorId });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');

    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (user) {
      const existing = await this.memberRepo.findOne({
        where: { user_id: user.id, incubator_id: incubatorId },
      });
      if (existing) throw new BadRequestException('Cet utilisateur est déjà membre');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      token,
      incubator_id: incubatorId,
      email: dto.email,
      role: dto.role,
      job_title: dto.job_title,
      expires_at: expiresAt,
    });
    await this.invitationRepo.save(invitation);

    await this.emailService.sendInvitation(dto.email, incubator.name, token);

    return {
      message: `Invitation envoyée à ${dto.email}`,
      token: process.env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async acceptInvitation(dto: AcceptInviteDto, userId: string): Promise<IncubatorMember> {
    const invitation = await this.invitationRepo.findOne({
      where: { token: dto.token },
      relations: ['incubator'],
    });
    
    if (!invitation) throw new BadRequestException('Token invalide');
    if (invitation.expires_at < new Date()) {
      await this.invitationRepo.remove(invitation);
      throw new BadRequestException("L'invitation a expiré");
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    
    if (user.email !== invitation.email) {
      throw new ForbiddenException("Cette invitation ne vous est pas destinée");
    }

    const existing = await this.memberRepo.findOne({
      where: { user_id: userId, incubator_id: invitation.incubator_id },
    });
    if (existing) throw new BadRequestException('Vous êtes déjà membre de cet incubateur');

    const member = this.memberRepo.create({
      user_id: userId,
      incubator_id: invitation.incubator_id,
      role: invitation.role as any,
      job_title: invitation.job_title,
      status: 'active',
    });

    const saved = await this.memberRepo.save(member);
    await this.invitationRepo.remove(invitation);

    return saved;
  }

  private async assertCanManageMembers(
    incubatorId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { incubator_id: incubatorId, user_id: userId },
    });
    if (!member) throw new ForbiddenException('Vous n\'êtes pas membre de cet incubateur');
    if (member.role !== 'admin' && !member.can_manage_members) {
      throw new ForbiddenException('Permissions insuffisantes pour gérer les membres');
    }
  }
  async declineInvitation(token: string, userId: string): Promise<{ message: string }> {
  const invitation = await this.invitationRepo.findOne({
    where: { token },
    relations: ['incubator'],
  });
  if (!invitation) throw new BadRequestException('Token invalide');
  if (invitation.expires_at < new Date()) {
    await this.invitationRepo.remove(invitation);
    throw new BadRequestException('Invitation déjà expirée');
  }

  const user = await this.userRepo.findOneBy({ id: userId });
  if (!user) throw new NotFoundException('Utilisateur introuvable');
  if (user.email !== invitation.email) {
    throw new ForbiddenException('Cette invitation ne vous est pas destinée');
  }
  // Optionnel : envoyer un email à l’inviteur pour l’informer du refus
  // await this.emailService.sendDeclineNotice(invitation.incubator.ownerId, user.email);
  await this.invitationRepo.remove(invitation);
  return { message: 'Invitation refusée avec succès' };
}
}