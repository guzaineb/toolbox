import { Module } from '@nestjs/common';
import { FinalDecisionsController } from './final-decisions.controller';
import { FinalDecisionsService } from './final-decisions.service';

@Module({
  controllers: [FinalDecisionsController],
  providers: [FinalDecisionsService],
  exports: [FinalDecisionsService],
})
export class FinalDecisionsModule {}
