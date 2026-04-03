import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { IncubatorMembersService } from './incubator-members.service';
import { IncubatorMembersController } from './incubator-members.controller';
import { User } from 'src/users/user.entity';
import { Incubator } from 'src/incubators/incubator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncubatorMember,User,Incubator])],
  controllers: [IncubatorMembersController],
  providers: [IncubatorMembersService],
  exports: [IncubatorMembersService],
})
export class IncubatorMembersModule {}