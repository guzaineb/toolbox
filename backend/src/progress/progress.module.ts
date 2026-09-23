import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressHistory } from './progress-history.entity';
import { ProjectStep } from '../journey/project-step.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressHistory, ProjectStep])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
