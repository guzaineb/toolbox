import { Controller, Post, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SummaryService } from '../summary.service';
import { ProjectIdParam } from '../dto/summary.dto';

@Controller('ai/summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summary: SummaryService) {}

  @Post('context/:projectId')
  async generateContextSummary(@Param() params: ProjectIdParam) {
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
  async generateActivitySummary(@Param() params: ProjectIdParam) {
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
  async generateCostRevenueSummary(@Param() params: ProjectIdParam) {
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
  async generateExecutiveSummary(@Param() params: ProjectIdParam) {
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
