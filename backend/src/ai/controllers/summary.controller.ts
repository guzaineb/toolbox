import { Controller, Post, Param, Req, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModuleAccessService } from '../../common/services/module-access.service';
import { SummaryService } from '../summary.service';
import { ProjectIdParam } from '../dto/summary.dto';

type RequestUser = { user: { id: string } };

@Controller('ai/summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(
    private readonly summary: SummaryService,
    private readonly access: ModuleAccessService,
  ) {}

  @Post('context/:projectId')
  async generateContextSummary(@Param() params: ProjectIdParam, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(params.projectId, req.user.id);
    try {
      const result = await this.summary.generateContextSummary(params.projectId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('activity/:projectId')
  async generateActivitySummary(@Param() params: ProjectIdParam, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(params.projectId, req.user.id);
    try {
      const result = await this.summary.generateActivitySummary(params.projectId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cost-revenue/:projectId')
  async generateCostRevenueSummary(@Param() params: ProjectIdParam, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(params.projectId, req.user.id);
    try {
      const result = await this.summary.generateCostRevenueSummary(params.projectId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('executive/:projectId')
  async generateExecutiveSummary(@Param() params: ProjectIdParam, @Req() req: RequestUser) {
    await this.access.assertCanAccessProject(params.projectId, req.user.id);
    try {
      const result = await this.summary.generateExecutiveSummary(params.projectId);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
