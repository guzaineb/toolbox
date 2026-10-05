import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SwotService } from './swot.service';
import { ProjectIdParam, UpdateSwotDto } from './dto/swot.dto';

@Controller('projects/:projectId/swot')
@UseGuards(JwtAuthGuard)
export class SwotController {
  constructor(private readonly swotService: SwotService) {}

  @Get()
  getSwotAnalysis(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.swotService.getSwotAnalysis(params.projectId, req.user.id);
  }

  @Post('generate')
  generateSwotAnalysis(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
  ) {
    return this.swotService.generateSwotAnalysis(params.projectId, req.user.id);
  }

  @Patch()
  updateSwotAnalysis(
    @Req() req: { user: { id: string } },
    @Param() params: ProjectIdParam,
    @Body() data: UpdateSwotDto,
  ) {
    return this.swotService.updateSwotAnalysis(
      params.projectId,
      data,
      req.user.id,
    );
  }
}
