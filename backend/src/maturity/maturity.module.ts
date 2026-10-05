import { Module } from '@nestjs/common';
import { MaturityScoreService } from './maturity-score.service';
import { MaturityController } from './maturity.controller';

@Module({
  controllers: [MaturityController],
  providers: [MaturityScoreService],
  exports: [MaturityScoreService],
})
export class MaturityModule {}
