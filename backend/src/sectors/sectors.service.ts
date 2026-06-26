import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './sector.entity';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private sectorRepo: Repository<Sector>,
  ) {}

  async findAll(): Promise<Sector[]> {
    return this.sectorRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Sector | null> {
    return this.sectorRepo.findOneBy({ id });
  }
}
