import { Module } from '@nestjs/common';
import { ImpactController } from './impact.controller';
import { ImpactService } from './impact.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ImpactController],
  providers: [ImpactService],
  exports: [ImpactService],
})
export class ImpactModule {}
