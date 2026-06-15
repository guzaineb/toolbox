import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncubatorMember } from './incubator-member.entity';
import { IncubatorMembersService } from './incubator-members.service';
import { IncubatorMembersController } from './incubator-members.controller';
import { User } from 'src/users/user.entity';
import { Incubator } from 'src/incubators/incubator.entity';
import { IncubatorInvitation } from './incubator-invitation.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncubatorMember,User,Incubator,IncubatorInvitation ])],
  controllers: [IncubatorMembersController],
  providers: [IncubatorMembersService,MailService],
  exports: [IncubatorMembersService],
})
export class IncubatorMembersModule {}