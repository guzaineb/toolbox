import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BmcService } from './bmc.service';
import { GenerateBmcDto } from './dto/generate-bmc.dto';
import { UpdateBmcDto } from './dto/update-bmc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/bmc')
export class BmcController {
  constructor(private bmcService: BmcService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generateBmc(
    @Param('projectId') projectId: string,
    @Body() dto: GenerateBmcDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.bmcService.generateBmc(projectId, req.user.id, dto.is_green);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getBmc(@Param('projectId') projectId: string) {
    return this.bmcService.getBmc(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getBmcHistory(@Param('projectId') projectId: string) {
    return this.bmcService.getBmcHistory(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateBmc(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateBmcDto,
  ) {
    return this.bmcService.updateBmc(projectId, dto.blocks, dto.is_green);
  }
}
