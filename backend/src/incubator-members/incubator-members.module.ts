import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { IncubatorMembersService } from './incubator-members.service';
import { IncubatorMembersController } from './incubator-members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IncubatorMember])],
  controllers: [IncubatorMembersController],
  providers: [IncubatorMembersService],
  exports: [IncubatorMembersService],
})
export class IncubatorMembersModule {}