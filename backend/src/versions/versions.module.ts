import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectVersion } from './project-version.entity';
import { VersionsService } from './versions.service';
import { VersionsController } from './versions.controller';
import { JourneyModule } from '../journey/journey.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectVersion]), JourneyModule],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
