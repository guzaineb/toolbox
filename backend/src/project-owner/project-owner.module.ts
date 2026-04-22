import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectOwnerProfile } from './project-owner-profile.entity';
import { ProjectOwnerService } from './project-owner.service';
import { ProjectOwnerController } from './project-owner.controller';
import { ProjectOwnerExperience } from './project-owner-experience.entity';
import { ProjectOwnerSkill } from './project-owner-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectOwnerProfile,ProjectOwnerExperience,ProjectOwnerSkill])],
  providers: [ProjectOwnerService],
  exports: [ProjectOwnerService],
  controllers: [ProjectOwnerController],
})
export class ProjectOwnerModule {}