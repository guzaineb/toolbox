import { Module } from '@nestjs/common';
import { EcoDesignController } from './eco-design.controller';
import { EcoDesignService } from './eco-design.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [EcoDesignController],
  providers: [EcoDesignService],
  exports: [EcoDesignService],
})
export class EcoDesignModule {}
