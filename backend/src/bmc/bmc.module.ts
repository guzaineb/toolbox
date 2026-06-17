import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BmcSnapshot } from './bmc-snapshot.entity';
import { BmcService } from './bmc.service';
import { BmcController } from './bmc.controller';
import { JourneyModule } from '../journey/journey.module';
import { VersionsModule } from '../versions/versions.module';

@Module({
  imports: [TypeOrmModule.forFeature([BmcSnapshot]), JourneyModule, VersionsModule],
  controllers: [BmcController],
  providers: [BmcService],
  exports: [BmcService],
})
export class BmcModule {}
