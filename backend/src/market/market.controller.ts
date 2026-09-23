import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';
import { ProjectIdParam } from './dto/market.dto';

@Controller('projects/:projectId/market')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Get()
  get(@Req() req: { user: { id: string } }, @Param() params: ProjectIdParam) {
    return this.market.get(params.projectId, req.user.id);
  }

  @Patch()
  update(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: any,
  ) {
    return this.market.update(params.projectId, data, req.user.id);
  }

  @Get('progress')
  getProgress(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.market.getProgress(params.projectId, req.user.id);
  }
}
