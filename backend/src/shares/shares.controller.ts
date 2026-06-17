import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('projects/:projectId/shares')
  createShare(
    @Param('projectId') projectId: string,
    @Body() dto: CreateShareDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.sharesService.createShare(projectId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:projectId/shares')
  getShares(@Param('projectId') projectId: string) {
    return this.sharesService.getShares(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('projects/:projectId/shares/:shareId')
  revokeShare(
    @Param('shareId') shareId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.sharesService.revokeShare(shareId, req.user.id);
  }

  @Get('shared/:token/project')
  getSharedProject(@Param('token') token: string) {
    return this.sharesService.getSharedProject(token);
  }

  @Get('shared/:token/bmc')
  getSharedBmc(@Param('token') token: string) {
    return this.sharesService.getSharedBmc(token);
  }
}
