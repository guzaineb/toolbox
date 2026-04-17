import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
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

  // ✅ REGISTER (génère token + code OTP)
  async register(registerDto: CreateUserDto) {
    const verificationToken = uuidv4();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date();
    codeExpires.setHours(codeExpires.getHours() + 1);

    const user = await this.usersService.create(
      registerDto,
      verificationToken,
      verificationCode,
      codeExpires,
    );

    if (!user) {
      throw new BadRequestException("Erreur lors de la création de l'utilisateur");
    }

    try {
      // ✅ Appel avec 3 arguments : (email, code, token)
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationCode,
        verificationToken,
      );
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }

    return {
      message: 'Inscription réussie. Veuillez vérifier votre email avec le code reçu.',
    };
  }

  // ✅ VERIFICATION PAR TOKEN (lien direct)
  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token manquant');
    }

    const user = await this.usersRepository.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token de vérification invalide ou expiré.');
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_code = null;        // ✅ autorisé car nullable
    user.verification_code_expires = null; // ✅ autorisé car nullable

    await this.usersRepository.save(user);
    return { message: 'Email vérifié avec succès.' };
  }

  // ✅ VERIFICATION PAR CODE OTP
  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user || user.verification_code !== code) {
      throw new BadRequestException('Code invalide');
    }
    if (new Date() > user.verification_code_expires!) {
      throw new BadRequestException('Code expiré. Demandez un nouveau lien.');
    }
    user.is_verified = true;
    user.verification_token = null;
    user.verification_code = null;
    user.verification_code_expires = null;
    await this.usersRepository.save(user);
    return { message: 'Email vérifié avec succès.' };
  }

  // ✅ VALIDATE USER (pour login)
  async validateUser(email: string, password: string): Promise<Partial<User>> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.is_verified) {
      throw new UnauthorizedException(
        'Veuillez vérifier votre adresse email avant de vous connecter.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const { password_hash, verification_token, verification_code, verification_code_expires, ...result } = user;
    return result;
  }

  // ✅ LOGIN
  async login(user: Partial<User>) {
    const payload = { sub: user.id, email: user.email };
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      access_token: this.jwtService.sign(payload),
    };
  }
}