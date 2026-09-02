import { Module } from '@nestjs/common';
import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';

@Module({
  controllers: [ExpertController],
  providers: [ExpertService, ExpertScoringService, ExpertRecommendationService],
  exports: [ExpertService],
})
export class ExpertModule {}
