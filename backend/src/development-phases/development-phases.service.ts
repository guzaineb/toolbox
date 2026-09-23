import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevelopmentPhase } from './development-phase.entity';

@Injectable()
export class DevelopmentPhasesService {
  constructor(
    @InjectRepository(DevelopmentPhase)
    private phaseRepo: Repository<DevelopmentPhase>,
  ) {}

  async findAll(): Promise<DevelopmentPhase[]> {
    return this.phaseRepo.find({ order: { order_index: 'ASC' } });
  }

  async findOne(id: string): Promise<DevelopmentPhase | null> {
    return this.phaseRepo.findOneBy({ id });
  }
}
