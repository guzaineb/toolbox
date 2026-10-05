import { Module } from '@nestjs/common';
import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';
import { ProjectProfileBuilder } from './services/project-profile-builder.service';

@Module({
  controllers: [ExpertController],
  providers: [
    ExpertService,
    ExpertScoringService,
    ExpertRecommendationService,
    ProjectProfileBuilder,
  ],
  exports: [ExpertService],
})
export class ExpertModule {}
