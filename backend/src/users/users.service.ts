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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      email: createUserDto.email,
      password_hash: hashed,
    });
    const savedUser = await this.userRepository.save(user);

    // Create associated user profile
    const profile = this.profileRepository.create({
      user: savedUser,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
    });
    await this.profileRepository.save(profile);

    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['profile'] });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['profile'] });
  }
}