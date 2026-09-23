import { Module } from '@nestjs/common';
import { SwotController } from './swot.controller';
import { SwotService } from './swot.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SwotController],
  providers: [SwotService],
  exports: [SwotService],
})
export class SwotModule {}
