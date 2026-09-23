import { Module } from '@nestjs/common';
import { BusinessPlanController } from './business-plan.controller';
import { BusinessPlanService } from './business-plan.service';
import { AiModule } from '../ai/ai.module';
import { GbmModule } from '../gbm/gbm.module';

@Module({
  imports: [AiModule, GbmModule],
  controllers: [BusinessPlanController],
  providers: [BusinessPlanService],
  exports: [BusinessPlanService],
})
export class BusinessPlanModule {}
