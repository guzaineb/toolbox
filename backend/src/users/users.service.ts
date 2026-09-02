import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from '../profiles/dto/update-profile.dto';
import { Language } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    verificationToken: string,
    verificationCode: string,
    codeExpires: Date,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) throw new ConflictException('Cet email est déjà utilisé.');

    const hashed = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password_hash: hashed,
        verification_token: verificationToken,
        verification_code: verificationCode,
        verification_code_expires: codeExpires,
        is_verified: false,
        role: createUserDto.role || null,
        profile: {
          create: {
            first_name: createUserDto.profile.first_name,
            last_name: createUserDto.profile.last_name,
            phone: createUserDto.profile.phone,
            birth_date: createUserDto.profile.birthDate
              ? new Date(createUserDto.profile.birthDate)
              : undefined,
            country: createUserDto.profile.country,
            city: createUserDto.profile.city,
            address: createUserDto.profile.address,
            preferred_language: createUserDto.profile
              .preferredLanguage as Language,
            bio: createUserDto.profile.bio,
            linkedin: createUserDto.profile.linkedin,
          },
        },
      },
      include: { profile: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        projectOwnerProfile: true,
        expertProfile: true,
        incubatorMembers: true,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.profile) throw new NotFoundException('Profile not found');

    const updateData: any = { ...data };
    if (data.birth_date) {
      updateData.birth_date = new Date(data.birth_date);
    }

    await this.prisma.userProfile.update({
      where: { id: user.profile.id },
      data: updateData,
    });
    return this.findById(userId);
  }

  async getUsers(options: any = {}) {
    const where = options.where || {};
    const orderBy = options.order || undefined;
    const skip = options.skip || undefined;
    const take = options.take || undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy,
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, total };
  }
}
