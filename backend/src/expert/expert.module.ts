import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { ExpertiseArea } from './expertise-area.entity';
import { ExpertService } from './expert.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertProfile, ExpertiseArea])],
  providers: [ExpertService],
  exports: [ExpertService],
})
export class ExpertModule {}