import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { NotificationEvent } from '../events/notification-event.enum';
import { NotificationPayload } from '../events/notification-payload.interface';
import { NotificationMessageBuilder } from '../events/notification-message-builder';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly messageBuilder: NotificationMessageBuilder,
  ) {}

  async register(registerDto: CreateUserDto) {
    const verificationToken = uuidv4();
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const codeExpires = new Date();
    codeExpires.setHours(codeExpires.getHours() + 1);

    const user = await this.usersService.create(
      registerDto,
      verificationToken,
      verificationCode,
      codeExpires,
    );

    if (!user) {
      throw new BadRequestException(
        "Erreur lors de la création de l'utilisateur",
      );
    }
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
        verificationToken,
      );
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }

    const { title, message } = this.messageBuilder.newUserRegistered({
      email: user.email,
    });
    this.eventEmitter.emit(NotificationEvent.NEW_USER_REGISTERED, {
      event: NotificationEvent.NEW_USER_REGISTERED,
      recipients: [{ userId: user.id }],
      title,
      message,
      senderId: user.id,
      resourceType: 'USER',
      resourceId: user.id,
    } as NotificationPayload);

    return {
      message:
        'Inscription réussie. Veuillez vérifier votre email avec le code reçu.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token manquant');
    }

    const decodedToken = decodeURIComponent(token.trim());

    const user = await this.prisma.user.findFirst({
      where: { verification_token: decodedToken },
    });

    if (!user) {
      throw new BadRequestException(
        'Token de vérification invalide ou déjà utilisé.',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_code: null,
        verification_code_expires: null,
      },
    });

    return { message: 'Email vérifié avec succès.' };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (user.is_verified) {
      return { message: 'Email déjà vérifié.' };
    }

    if (user.verification_code !== code) {
      throw new BadRequestException('Code invalide');
    }

    if (
      !user.verification_code_expires ||
      new Date() > user.verification_code_expires
    ) {
      throw new BadRequestException('Code expiré. Demandez un nouveau lien.');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        is_verified: true,
        verification_token: null,
        verification_code: null,
        verification_code_expires: null,
      },
    });

    return { message: 'Email vérifié avec succès.' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email requis');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Aucun compte associé à cet email.');
    }
    if (user.is_verified) {
      return { message: 'Cet email est déjà vérifié.' };
    }

    const verificationToken = uuidv4();
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const codeExpires = new Date();
    codeExpires.setHours(codeExpires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verification_token: verificationToken,
        verification_code: verificationCode,
        verification_code_expires: codeExpires,
      },
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
        verificationToken,
      );
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }

    return { message: 'Un nouveau code de vérification a été envoyé.' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!freshUser || !freshUser.is_verified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre adresse email avant de vous connecter.',
      );
    }

    if (!freshUser.is_active) {
      throw new UnauthorizedException('Ce compte a été désactivé.');
    }

    const isMatch = await bcrypt.compare(password, freshUser.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.prisma.user.update({
      where: { id: freshUser.id },
      data: { last_login_at: new Date() },
    });

    const {
      password_hash,
      verification_token,
      verification_code,
      verification_code_expires,
      ...result
    } = freshUser;

    return result;
  }

  async login(user: { id: string; email: string; role: any }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      access_token: this.jwtService.sign(payload),
    };
  }
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        message:
          'Si un compte existe, un email de réinitialisation a été envoyé.',
      };
    }

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: token,
        reset_password_expires: expires,
      },
    });

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return {
      message:
        'Si un compte existe, un email de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { reset_password_token: token },
    });
    if (!user) {
      throw new BadRequestException('Token invalide ou expiré.');
    }

    if (
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throw new BadRequestException('Le token a expiré. Refaites une demande.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return { message: 'Mot de passe mis à jour avec succès.' };
  }
}
