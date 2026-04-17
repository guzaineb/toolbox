import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserProfile } from '../profiles/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    verificationToken: string,
    verificationCode: string,
    codeExpires: Date,
  ): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    const hashed = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password_hash: hashed,
      verification_token: verificationToken,
      verification_code: verificationCode,
      verification_code_expires: codeExpires,
      is_verified: false,
      role: createUserDto.role || null,
      profile: {
        first_name: createUserDto.profile.first_name,
        last_name: createUserDto.profile.last_name,
        phone: createUserDto.profile.phone,
        birth_date: createUserDto.profile.birthDate,
        country: createUserDto.profile.country,
        city: createUserDto.profile.city,
        address: createUserDto.profile.address,
        preferred_language: createUserDto.profile.preferredLanguage,
        bio: createUserDto.profile.bio,
        linkedin: createUserDto.profile.linkedin,
      },
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['profile'] });
  }

  async findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'projectOwnerProfile', 'expertProfile', 'incubatorMembers'],
    });
  }

  // ✅ AJOUT : mise à jour du profil personnel
  async updateProfile(userId: string, data: Partial<UserProfile>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user || !user.profile) return null;

    await this.profileRepository.update({ id: user.profile.id }, data);
    return this.findById(userId);
  }

  async getUsers(options: any = {}) {
    const [users, total] = await this.userRepository.findAndCount({
      ...options,
      relations: ['profile'],
    });
    return { data: users, total };
  }
}