import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incubator } from './incubator.entity';
import { IncubatorsService } from './incubators.service';
import { IncubatorsController } from './incubators.controller';
import { IncubatorMember } from '../incubator-members/incubator-member.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incubator, IncubatorMember, User])
  ],
  controllers: [IncubatorsController],
  providers: [IncubatorsService],   // ← PAS de IncubatorRepository ici
  exports: [IncubatorsService],
})
export class IncubatorsModule {}