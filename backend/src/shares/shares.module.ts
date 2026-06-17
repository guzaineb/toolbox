import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectShare } from './project-share.entity';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { ProjectsModule } from '../projects/projects.module';
import { BmcModule } from '../bmc/bmc.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectShare]), ProjectsModule, BmcModule],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
