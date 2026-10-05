import { Module } from '@nestjs/common';
import { JuriesController } from './juries.controller';
import { JuriesService } from './juries.service';

@Module({
  controllers: [JuriesController],
  providers: [JuriesService],
  exports: [JuriesService],
})
export class JuriesModule {}
