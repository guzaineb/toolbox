import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AcceptInviteDto, InviteMemberDto } from './dto/invite-member.dto';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';
import { MemberRole } from '@prisma/client';

@Injectable()
export class IncubatorMembersService {
  constructor(
    private prisma: PrismaService,
    private emailService: MailService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async addMember(
    incubatorId: string,
    dto: AddMemberDto,
    currentUserId: string,
  ) {
    await this.assertCanManageMembers(incubatorId, currentUserId);

    // Accepter les deux conventions : user_id (snake, API) ou userId (camel, rétro)
    const targetUserId = dto.user_id ?? dto.userId;
    if (!targetUserId) {
      throw new BadRequestException('user_id est requis');
    }

    const existing = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: {
          user_id: targetUserId,
          incubator_id: incubatorId,
        },
      },
    });
    if (existing)
      throw new BadRequestException('Cet utilisateur est déjà membre');

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const incubator = await this.prisma.incubator.findUnique({
      where: { id: incubatorId },
    });
    if (!incubator) throw new BadRequestException('Incubateur introuvable');

    const result = await this.prisma.incubatorMember.create({
      data: {
        user_id: targetUserId,
        incubator_id: incubatorId,
        role: dto.role as any,
        job_title: dto.job_title,
        can_manage_members: dto.can_manage_members || false,
        status: 'ACTIVE',
      },
    });

    const { title, message } = this.messageBuilder.memberJoined({
      incubatorName: incubator.name,
    });
    this.eventEmitter.emit(NotificationEvent.MEMBER_JOINED, {
      event: NotificationEvent.MEMBER_JOINED,
      recipients: [{ userId: targetUserId }],
      title,
      message,
      link: `/incubator/${incubatorId}`,
      senderId: currentUserId,
      resourceType: 'INCUBATOR',
      resourceId: incubatorId,
    } as NotificationPayload);

    return result;
  }

  async findByIncubator(incubatorId: string) {
    return this.prisma.incubatorMember.findMany({
      where: { incubator_id: incubatorId },
      include: { user: { include: { profile: true } } },
    });
  }

  async getMyMembership(incubatorId: string, userId: string) {
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
      },
      include: { user: { include: { profile: true } }, incubator: true },
    });
    if (!member)
      throw new NotFoundException("Vous n'êtes pas membre de cet incubateur");
    return member;
  }

  async updateMember(
    memberId: string,
    incubatorId: string,
    dto: UpdateMemberDto,
    currentUserId: string,
  ) {
    await this.assertCanManageMembers(incubatorId, currentUserId);

    const member = await this.prisma.incubatorMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.incubator_id !== incubatorId)
      throw new NotFoundException('Membre introuvable');

    if (dto.role && dto.role !== 'ADMIN' && member.role === 'ADMIN') {
      const adminCount = await this.prisma.incubatorMember.count({
        where: { incubator_id: incubatorId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Il doit rester au moins un administrateur',
        );
      }
    }

    const result = await this.prisma.incubatorMember.update({
      where: { id: memberId },
      data: dto as any,
    });

    const incubator = await this.prisma.incubator.findUnique({
      where: { id: incubatorId },
      select: { name: true },
    });
    const { title, message } = this.messageBuilder.memberUpdated({
      incubatorName: incubator?.name ?? 'Incubateur',
    });
    this.eventEmitter.emit(NotificationEvent.MEMBER_UPDATED, {
      event: NotificationEvent.MEMBER_UPDATED,
      recipients: [{ userId: member.user_id }],
      title,
      message,
      link: `/incubator/${incubatorId}`,
      senderId: currentUserId,
      resourceType: 'INCUBATOR',
      resourceId: incubatorId,
    } as NotificationPayload);

    return result;
  }

  async removeMember(
    memberId: string,
    incubatorId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);
    const member = await this.prisma.incubatorMember.findUnique({
      where: { id: memberId },
    });
    if (!member || member.incubator_id !== incubatorId)
      throw new NotFoundException('Membre introuvable');

    if (member.role === 'ADMIN') {
      const adminCount = await this.prisma.incubatorMember.count({
        where: { incubator_id: incubatorId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Impossible de supprimer le seul administrateur',
        );
      }
    }

    if (member.user_id === currentUserId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous retirer vous-même',
      );
    }

    const incubator = await this.prisma.incubator.findUnique({
      where: { id: incubatorId },
      select: { name: true },
    });
    await this.prisma.incubatorMember.delete({ where: { id: memberId } });

    const { title, message } = this.messageBuilder.memberRemoved({
      incubatorName: incubator?.name ?? 'Incubateur',
    });
    this.eventEmitter.emit(NotificationEvent.MEMBER_LEFT, {
      event: NotificationEvent.MEMBER_LEFT,
      recipients: [{ userId: member.user_id }],
      title,
      message,
      link: `/incubator/${incubatorId}`,
      senderId: currentUserId,
      resourceType: 'INCUBATOR',
      resourceId: incubatorId,
    } as NotificationPayload);

    return { message: 'Membre supprimé' };
  }

  async inviteMember(
    incubatorId: string,
    dto: InviteMemberDto,
    currentUserId: string,
  ): Promise<{ message: string; token?: string }> {
    await this.assertCanManageMembers(incubatorId, currentUserId);

    const incubator = await this.prisma.incubator.findUnique({
      where: { id: incubatorId },
    });
    if (!incubator) throw new NotFoundException('Incubateur introuvable');

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      const existing = await this.prisma.incubatorMember.findUnique({
        where: {
          user_id_incubator_id: { user_id: user.id, incubator_id: incubatorId },
        },
      });
      if (existing)
        throw new BadRequestException('Cet utilisateur est déjà membre');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.incubatorInvitation.create({
      data: {
        token,
        incubator_id: incubatorId,
        email: dto.email,
        role: dto.role as MemberRole,
        job_title: dto.job_title,
        expires_at: expiresAt,
      },
    });

    await this.emailService.sendInvitation(
      dto.email,
      incubator.name,
      token,
      incubatorId,
    );

    return {
      message: `Invitation envoyée à ${dto.email}`,
      token: process.env.NODE_ENV === 'development' ? token : undefined,
    };
  }

  async acceptInvitation(dto: AcceptInviteDto, userId: string) {
    const invitation = await this.prisma.incubatorInvitation.findUnique({
      where: { token: dto.token },
      include: { incubator: true },
    });

    if (!invitation) throw new BadRequestException('Token invalide');
    if (invitation.expires_at < new Date()) {
      await this.prisma.incubatorInvitation.delete({
        where: { id: invitation.id },
      });
      throw new BadRequestException("L'invitation a expiré");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.email !== invitation.email) {
      throw new ForbiddenException('Cette invitation ne vous est pas destinée');
    }

    const existing = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: {
          user_id: userId,
          incubator_id: invitation.incubator_id,
        },
      },
    });
    if (existing)
      throw new BadRequestException('Vous êtes déjà membre de cet incubateur');

    const saved = await this.prisma.incubatorMember.create({
      data: {
        user_id: userId,
        incubator_id: invitation.incubator_id,
        role: invitation.role as any,
        job_title: invitation.job_title,
        status: 'ACTIVE',
      },
    });

    await this.prisma.incubatorInvitation.delete({
      where: { id: invitation.id },
    });

    return saved;
  }

  private async assertCanManageMembers(
    incubatorId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.prisma.incubatorMember.findUnique({
      where: {
        user_id_incubator_id: { user_id: userId, incubator_id: incubatorId },
      },
    });
    if (!member)
      throw new ForbiddenException("Vous n'êtes pas membre de cet incubateur");
    if (member.role !== 'ADMIN' && !member.can_manage_members) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour gérer les membres',
      );
    }
  }
  async declineInvitation(
    token: string,
    userId: string,
  ): Promise<{ message: string }> {
    const invitation = await this.prisma.incubatorInvitation.findUnique({
      where: { token },
      include: { incubator: true },
    });
    if (!invitation) throw new BadRequestException('Token invalide');
    if (invitation.expires_at < new Date()) {
      await this.prisma.incubatorInvitation.delete({
        where: { id: invitation.id },
      });
      throw new BadRequestException('Invitation déjà expirée');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    if (user.email !== invitation.email) {
      throw new ForbiddenException('Cette invitation ne vous est pas destinée');
    }
    await this.prisma.incubatorInvitation.delete({
      where: { id: invitation.id },
    });
    return { message: 'Invitation refusée avec succès' };
  }
}
