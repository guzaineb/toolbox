import { Module } from '@nestjs/common';
import { IncubatorMembersService } from './incubator-members.service';
import { IncubatorMembersController } from './incubator-members.controller';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [IncubatorMembersController],
  providers: [IncubatorMembersService,MailService],
  exports: [IncubatorMembersService],
})
export class IncubatorMembersModule {}