import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { ExpertiseArea } from './expertise-area.entity';
import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';
import { ExpertProfileExpertiseArea } from './expert-profile-expertise-area.entity';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertProfile, ExpertiseArea,   ExpertProfileExpertiseArea])],
  controllers: [ExpertController],
  providers: [ExpertService,
       
    ExpertScoringService,
    ExpertRecommendationService,
  ],
  exports: [ExpertService],
})
export class ExpertModule {}