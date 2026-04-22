import {Injectable,BadRequestException,ForbiddenException,NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

import { User } from '../users/user.entity';
import { Incubator } from '../incubators/incubator.entity';
import * as crypto from 'crypto';
import { AcceptInviteDto, InviteMemberDto } from './dto/invite-member.dto';

// Stockage en mémoire pour les invitations (à remplacer par une table BDD en prod)
const pendingInvitations = new Map<
  string,
  { incubatorId: string; email: string; role: string; job_title?: string; expiresAt: Date }
>();

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

  // ─── Ajouter un membre (par UUID) ───────────────────────────────────────────
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

  // ─── Lister les membres ─────────────────────────────────────────────────────
  async findByIncubator(incubatorId: string): Promise<IncubatorMember[]> {
    return this.memberRepo.find({
      where: { incubator_id: incubatorId },
      relations: ['user', 'user.profile'],
    });
  }

  // ─── Mon rôle dans l'incubateur ─────────────────────────────────────────────
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

  // ─── Modifier un membre ──────────────────────────────────────────────────────
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

    // Empêcher la suppression du dernier admin
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
async removeMember(memberId: string,incubatorId: string,currentUserId: string,): Promise<{ message: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);
    const member = await this.memberRepo.findOne({
      where: { id: memberId, incubator_id: incubatorId },});
    if (!member) throw new NotFoundException('Membre introuvable');
    // Empêcher la suppression du dernier admin
    if (member.role === 'admin') {
      const adminCount = await this.memberRepo.count({
        where: { incubator_id: incubatorId, role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException("Impossible de supprimer le seul administrateur");
      }
    }

    // Empêcher l'auto-suppression si c'est le current user
    if (member.user_id === currentUserId) {
      throw new BadRequestException("Vous ne pouvez pas vous retirer vous-même");
    }

    await this.memberRepo.remove(member);
    return { message: 'Membre supprimé' };
  }

  // ─── Inviter par email ───────────────────────────────────────────────────────
  async inviteMember(incubatorId: string,dto: InviteMemberDto,currentUserId: string,): Promise<{ message: string; token?: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);
    const incubator = await this.incubatorRepo.findOneBy({ id: incubatorId });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');

    // Vérifier si l'utilisateur existe déjà
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (user) {
      const existing = await this.memberRepo.findOne({
        where: { user_id: user.id, incubator_id: incubatorId },
      });
      if (existing) throw new BadRequestException('Cet utilisateur est déjà membre');
    }

    // Générer un token d'invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    pendingInvitations.set(token, {
      incubatorId,
      email: dto.email,
      role: dto.role,
      job_title: dto.job_title,
      expiresAt,
    });

    // TODO: Envoyer un email avec le token (intégrer un service mail)
    // await this.mailService.sendInvitation(dto.email, incubator.name, token);
    return {
      message: `Invitation envoyée à ${dto.email}`,
      token, // Exposé seulement en développement - à retirer en prod
    };
  }
 async acceptInvitation(dto: AcceptInviteDto,userId: string,): Promise<IncubatorMember> {
    const invitation = pendingInvitations.get(dto.token);
    if (!invitation) throw new BadRequestException('Token invalide ou expiré');

    if (invitation.expiresAt < new Date()) {
      pendingInvitations.delete(dto.token);
      throw new BadRequestException("L'invitation a expiré");
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.email !== invitation.email) {
      throw new ForbiddenException("Cette invitation ne vous est pas destinée");
    }
    const existing = await this.memberRepo.findOne({
      where: { user_id: userId, incubator_id: invitation.incubatorId },
    });
    if (existing) throw new BadRequestException('Vous êtes déjà membre de cet incubateur');
    const member = this.memberRepo.create({
      user_id: userId,
      incubator_id: invitation.incubatorId,
      role: invitation.role as any,
      job_title: invitation.job_title,
      status: 'active',
    });

    const saved = await this.memberRepo.save(member);
    pendingInvitations.delete(dto.token);

    return saved;
  }

  // ─── Helper : vérifie les droits de gestion ──────────────────────────────────
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
}
