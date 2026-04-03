import { Controller, Post, Body, Param, UseGuards, Req, Get } from '@nestjs/common';
import { IncubatorMembersService } from './incubator-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incubators/:incubatorId/members')
@UseGuards(JwtAuthGuard)
export class IncubatorMembersController {
  constructor(private membersService: IncubatorMembersService) {}

  @Post()
  add(@Param('incubatorId') incubatorId: string, @Body() dto: AddMemberDto, @Req() req) {
    return this.membersService.addMember(incubatorId, dto, req.user.id);
  }

  @Get()
  list(@Param('incubatorId') incubatorId: string) {
    return this.membersService.findByIncubator(incubatorId);
  }
}