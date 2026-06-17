import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { JourneyModule } from '../journey/journey.module';
import { BmcModule } from '../bmc/bmc.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [JourneyModule, BmcModule, ReviewsModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
