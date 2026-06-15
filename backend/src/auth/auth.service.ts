import { Injectable, BadRequestException, UnauthorizedException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private mailService: MailService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(registerDto: CreateUserDto) {
    const verificationToken = uuidv4();
    // ✅ FIX: verificationCode était généré mais jamais passé à usersService.create()
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date();
    codeExpires.setHours(codeExpires.getHours() + 1);

    // ✅ FIX: signature corrigée — on passe les 4 arguments requis par UsersService.create()
    const user = await this.usersService.create(
      registerDto,
      verificationToken,
      verificationCode,   // ← était manquant avant
      codeExpires,
    );

    if (!user) {
      throw new BadRequestException("Erreur lors de la création de l'utilisateur");
    }
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
        verificationToken,
      );
    } catch (error) {
      console.error('Erreur envoi email:', error);
      // ✅ Note: on ne throw pas ici pour ne pas bloquer l'inscription
      // mais en production, envisagez une queue (Bull/Redis) pour retry
    }

    return {
      message: 'Inscription réussie. Veuillez vérifier votre email avec le code reçu.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token manquant');
    }

    const decodedToken = decodeURIComponent(token.trim());

    // ✅ update() direct évite les problèmes de nullable avec save()
    const result = await this.usersRepository.update(
      { verification_token: decodedToken },
      {
        is_verified: true,
        verification_token: null,
        verification_code: null,
        verification_code_expires: null,
      },
    );

    if (!result.affected || result.affected === 0) {
      throw new BadRequestException('Token de vérification invalide ou déjà utilisé.');
    }

    return { message: 'Email vérifié avec succès.' };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

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

    await this.usersRepository.update(
      { email },
      {
        is_verified: true,
        verification_token: null,
        verification_code: null,
        verification_code_expires: null,
      },
    );

    return { message: 'Email vérifié avec succès.' };
  }

  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // ✅ Recharge depuis la base pour avoir is_verified et role à jour
    const freshUser = await this.usersRepository.findOne({
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

    // ✅ Mise à jour de last_login_at
    await this.usersRepository.update(
      { id: freshUser.id },
      { last_login_at: new Date() },
    );

    const {
      password_hash,
      verification_token,
      verification_code,
      verification_code_expires,
      ...result
    } = freshUser;

    return result;
  }

  async login(user: Partial<User>) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // ✅ Le role est inclus dans le JWT payload pour les guards
      access_token: this.jwtService.sign(payload),
    };
  }
async forgotPassword(email: string): Promise<{ message: string }> {
  const user = await this.usersRepository.findOne({ where: { email } });
  if (!user) {
    // Sécurité : on répond pareil même si l'email n'existe pas
    return { message: 'Si un compte existe, un email de réinitialisation a été envoyé.' };
  }

  const token = uuidv4();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);

  await this.usersRepository.update(user.id, {
    resetPasswordToken: token,
    resetPasswordExpires: expires,
  });

  // Envoi de l'email
  await this.mailService.sendResetPasswordEmail(user.email, token);

  return { message: 'Si un compte existe, un email de réinitialisation a été envoyé.' };
}

async resetPassword(token: string, newPassword: string) {
  console.log('Token reçu:', token);
  const user = await this.usersRepository.findOne({
    where: { resetPasswordToken: token },
  });
  console.log('Utilisateur trouvé:', user?.id, user?.resetPasswordExpires);
  if (!user) {
    throw new BadRequestException('Token invalide ou expiré.');
  }

  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new BadRequestException('Le token a expiré. Refaites une demande.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await this.usersRepository.update(user.id, {
    password_hash: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return { message: 'Mot de passe mis à jour avec succès.' };
}
}
