import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';
import { ProjectOwnerService } from './project-owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectOwnerProfile])],
  providers: [ProjectOwnerService],
  exports: [ProjectOwnerService],
})
export class ProjectOwnerModule {}