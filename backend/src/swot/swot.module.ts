import { Module } from '@nestjs/common';
import { SwotController } from './swot.controller';
import { SwotService } from './swot.service';
import { AiModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [AiModule, ProjectsModule],
  controllers: [SwotController],
  providers: [SwotService],
  exports: [SwotService],
})
export class SwotModule {}
