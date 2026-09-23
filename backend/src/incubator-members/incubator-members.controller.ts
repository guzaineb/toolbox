import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IncubatorMembersService } from './incubator-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AcceptInviteDto, InviteMemberDto } from './dto/invite-member.dto';

@Controller('incubators/:incubatorId/members')
@UseGuards(JwtAuthGuard)
export class IncubatorMembersController {
  constructor(private membersService: IncubatorMembersService) {}

  @Post()
  add(
    @Param('incubatorId') incubatorId: string,
    @Body() dto: AddMemberDto,
    @Req() req,
  ) {
    return this.membersService.addMember(incubatorId, dto, req.user.id);
  }

  @Get()
  list(@Param('incubatorId') incubatorId: string) {
    return this.membersService.findByIncubator(incubatorId);
  }
  @Get('me')
  getMe(@Param('incubatorId') incubatorId: string, @Req() req) {
    return this.membersService.getMyMembership(incubatorId, req.user.id);
  }
  @Patch(':id')
  update(
    @Param('incubatorId') incubatorId: string,
    @Param('id') memberId: string,
    @Body() dto: UpdateMemberDto,
    @Req() req,
  ) {
    return this.membersService.updateMember(
      memberId,
      incubatorId,
      dto,
      req.user.id,
    );
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('incubatorId') incubatorId: string,
    @Param('id') memberId: string,
    @Req() req,
  ) {
    return this.membersService.removeMember(memberId, incubatorId, req.user.id);
  }

  @Post('invite')
  invite(
    @Param('incubatorId') incubatorId: string,
    @Body() dto: InviteMemberDto,
    @Req() req,
  ) {
    return this.membersService.inviteMember(incubatorId, dto, req.user.id);
  }
  @Post('accept')
  async acceptInvite(@Body() dto: AcceptInviteDto, @Req() req) {
    return this.membersService.acceptInvitation(dto, req.user.id);
  }
  @Post('decline')
  @HttpCode(HttpStatus.OK)
  async declineInvite(@Body() dto: AcceptInviteDto, @Req() req) {
    return this.membersService.declineInvitation(dto.token, req.user.id);
  }
}
