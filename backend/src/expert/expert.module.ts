import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExpertService } from './expert.service';
import { ExpertController } from './expert.controller';
import { ExpertScoringService } from './services/expert-scoring.service';
import { ExpertRecommendationService } from './services/expert-recommendation.service';
import { ExpertSemanticRanker } from './services/expert-semantic-ranker.service';
import { ProjectProfileBuilder } from './services/project-profile-builder.service';

@Module({
  imports: [AiModule],
  controllers: [ExpertController],
  providers: [
    ExpertService,
    ExpertScoringService,
    ExpertRecommendationService,
    ExpertSemanticRanker,
    ProjectProfileBuilder,
  ],
  exports: [ExpertService],
})
export class ExpertModule {}
